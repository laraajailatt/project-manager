'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApi } from './useApi'

export interface ProjectTask {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  dueDate?: string
  createdAt: string
  updatedAt: string
  project: {
    id: string
    title: string
  }
}

export interface ProjectDetail {
  id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
  tasks: ProjectTask[]
  _count: {
    tasks: number
  }
}

export function useProject(projectId: string) {
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const { execute } = useApi<{ project: ProjectDetail }>()

  const fetchProject = useCallback(async () => {
    if (!projectId) return
    
    setLoading(true)
    try {
      const data = await execute(
        () => fetch(`/api/projects/${projectId}`, { credentials: 'include' }),
        { showErrorToast: true }
      )
      setProject(data.project)
    } catch {
      // Error already handled by useApi
      setProject(null)
    } finally {
      setLoading(false)
    }
  }, [execute, projectId])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  return {
    project,
    loading,
    refetch: fetchProject,
  }
}
