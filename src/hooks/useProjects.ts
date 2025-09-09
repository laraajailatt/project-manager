'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApi } from './useApi'

export interface Project {
  id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
  _count: {
    tasks: number
  }
}

export interface CreateProjectData {
  title: string
  description?: string
}

export interface UpdateProjectData {
  title?: string
  description?: string
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { execute } = useApi<{ projects: Project[] }>()

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const data = await execute(
        () => fetch('/api/projects', { credentials: 'include' }),
        { showErrorToast: false, skipErrorToast: true }
      )
      setProjects(data.projects || [])
    } catch {
      // Error already handled by useApi
    } finally {
      setLoading(false)
    }
  }, [execute])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const createProject = useCallback(async (projectData: CreateProjectData) => {
    try {
      await execute(
        () => fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(projectData),
        }),
        {
          showSuccessToast: true,
          successMessage: 'Project created successfully',
          onSuccess: () => fetchProjects(),
        }
      )
    } catch (error) {
      // Error already handled by useApi
      throw error
    }
  }, [execute, fetchProjects])

  const updateProject = useCallback(async (id: string, projectData: UpdateProjectData) => {
    try {
      await execute(
        () => fetch(`/api/projects/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(projectData),
        }),
        {
          showSuccessToast: true,
          successMessage: 'Project updated successfully',
          onSuccess: () => fetchProjects(),
        }
      )
    } catch (error) {
      // Error already handled by useApi
      throw error
    }
  }, [execute, fetchProjects])

  const deleteProject = useCallback(async (id: string) => {
    try {
      await execute(
        () => fetch(`/api/projects/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        }),
        {
          showSuccessToast: true,
          successMessage: 'Project deleted successfully',
          onSuccess: () => fetchProjects(),
        }
      )
    } catch (error) {
      // Error already handled by useApi
      throw error
    }
  }, [execute, fetchProjects])

  return {
    projects,
    loading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  }
}
