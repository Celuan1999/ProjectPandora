'use client'

import { useState, useEffect } from 'react'
import { projectsApi } from '../api/projects'
import { Project } from '../types/api'
import { useUser } from '../context/userContext'

interface UseProjectsReturn {
  projects: Project[]
  inaccessibleProjects: { id: number; name: string; description: string | null }[]
  loading: boolean
  error: string | null
  refetch: () => void
  grantAccess: (projectId: number) => Promise<void>
}

export const useProjects = (): UseProjectsReturn => {
  const [projects, setProjects] = useState<Project[]>([])
  const [inaccessibleProjects, setInaccessibleProjects] = useState<{ id: number; name: string; description: string | null }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated } = useUser()

  const fetchProjects = async () => {
    if (!isAuthenticated() || !user?.access_token) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // For now, we'll use a placeholder orgId since we don't have org context yet
      if (!user.user) {
        setError('User not authenticated')
        setLoading(false)
        return
      }
      const userId = user.user.id;
      const [accessibleResponse, inaccessibleResponse] = await Promise.all([
        projectsApi.getProjects(user.access_token, userId),
        projectsApi.getInaccessibleProjects(user.access_token, userId)
      ])
      
      setProjects(accessibleResponse.data || [])
      setInaccessibleProjects(inaccessibleResponse.data || [])
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const grantAccess = async (projectId: number) => {
    if (!user?.access_token || !user?.user?.id) {
      throw new Error('User not authenticated')
    }

    try {
      await projectsApi.grantProjectAccess(user.access_token, user.user.id, projectId)
      // Refresh projects to show the newly accessible project
      await fetchProjects()
    } catch (error) {
      throw error
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [user, isAuthenticated])

  return {
    projects,
    inaccessibleProjects,
    loading,
    error,
    refetch: fetchProjects,
    grantAccess
  }
}
