'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Project } from '@/app/types/api'
import { projectsApi } from '@/app/api/projects'
import { useUser } from '@/app/context/userContext'

interface InaccessibleProject {
  id: number
  name: string
  description: string | null
}

interface ProjectContextType {
  // All projects (accessible + inaccessible)
  allProjects: (Project & { hasAccess: boolean })[]
  // Accessible projects only
  accessibleProjects: Project[]
  // Inaccessible projects only
  inaccessibleProjects: InaccessibleProject[]
  // Loading state
  loading: boolean
  error: string | null
  // Actions
  refetch: () => Promise<void>
  grantAccess: (projectId: number) => Promise<void>
  searchProjects: (searchTerm: string, limit?: number) => (Project & { hasAccess: boolean })[]
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [allProjects, setAllProjects] = useState<(Project & { hasAccess: boolean })[]>([])
  const [accessibleProjects, setAccessibleProjects] = useState<Project[]>([])
  const [inaccessibleProjects, setInaccessibleProjects] = useState<InaccessibleProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { user, isAuthenticated } = useUser()

  const fetchProjects = async () => {
    if (!isAuthenticated() || !user?.access_token || !user?.user?.id) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const userId = user.user.id
      const [accessibleResponse, inaccessibleResponse] = await Promise.all([
        projectsApi.getProjects(user.access_token, userId),
        projectsApi.getInaccessibleProjects(user.access_token, userId)
      ])
      
      const accessible = accessibleResponse.data || []
      const inaccessible = inaccessibleResponse.data || []
      
      // Combine all projects with access flag
      const combinedProjects = [
        ...accessible.map(project => ({ ...project, hasAccess: true })),
        ...inaccessible.map(project => ({ ...project, hasAccess: false }))
      ]
      
      setAllProjects(combinedProjects)
      setAccessibleProjects(accessible)
      setInaccessibleProjects(inaccessible)
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

  const searchProjects = (searchTerm: string, limit: number = 10): (Project & { hasAccess: boolean })[] => {
    if (!searchTerm.trim()) {
      return []
    }

    const filtered = allProjects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return filtered.slice(0, limit)
  }

  useEffect(() => {
    if (isAuthenticated() && user) {
      fetchProjects()
    }
  }, [user, isAuthenticated])

  return (
    <ProjectContext.Provider
      value={{
        allProjects,
        accessibleProjects,
        inaccessibleProjects,
        loading,
        error,
        refetch: fetchProjects,
        grantAccess,
        searchProjects
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

// Custom hook to consume the project context
export const useProjects = () => {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider')
  }
  return context
}
