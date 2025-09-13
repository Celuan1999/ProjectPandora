'use client'

import { useState, useEffect } from 'react'
import { projectsApi } from '../api/projects'
import { Project } from '../types/api'
import { useUser } from '../context/userContext'

interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useProjects = (): UseProjectsReturn => {
  const [projects, setProjects] = useState<Project[]>([])
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
      const orgId = 'default-org'
      const response = await projectsApi.getProjects(user.access_token, orgId)
      
      setProjects(response.data || [])
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [user, isAuthenticated])

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects
  }
}
