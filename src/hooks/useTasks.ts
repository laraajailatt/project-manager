'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApi } from './useApi'

export interface Task {
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

export interface CreateTaskData {
  title: string
  description?: string
  projectId: string
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE'
  dueDate?: string
}

export interface UpdateTaskData {
  title?: string
  description?: string
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE'
  dueDate?: string | null
}

export interface TaskFilters {
  projectId?: string
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE'
  dueDateFrom?: string
  dueDateTo?: string
}

export function useTasks(filters: TaskFilters = {}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { execute } = useApi<{ tasks: Task[] }>()

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        }
      })

      const data = await execute(
        () => fetch(`/api/tasks?${params.toString()}`, { credentials: 'include' }),
        { showErrorToast: true }
      )
      setTasks(data.tasks || [])
    } catch {
      // Error already handled by useApi
    } finally {
      setLoading(false)
    }
  }, [execute, JSON.stringify(filters)])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = useCallback(async (taskData: CreateTaskData) => {
    try {
      const payload = {
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined,
      }

      await execute(
        () => fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }),
        {
          showSuccessToast: true,
          successMessage: 'Task created successfully',
          onSuccess: () => fetchTasks(),
        }
      )
    } catch (error) {
      // Error already handled by useApi
      throw error
    }
  }, [execute, fetchTasks])

  const updateTask = useCallback(async (id: string, taskData: UpdateTaskData) => {
    try {
      const payload = {
        ...taskData,
        dueDate: taskData.dueDate === null 
          ? null 
          : taskData.dueDate 
            ? new Date(taskData.dueDate).toISOString() 
            : undefined,
      }

      await execute(
        () => fetch(`/api/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }),
        {
          showSuccessToast: true,
          successMessage: 'Task updated successfully',
          onSuccess: () => fetchTasks(),
        }
      )
    } catch (error) {
      // Error already handled by useApi
      throw error
    }
  }, [execute, fetchTasks])

  const deleteTask = useCallback(async (id: string) => {
    try {
      await execute(
        () => fetch(`/api/tasks/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        }),
        {
          showSuccessToast: true,
          successMessage: 'Task deleted successfully',
          onSuccess: () => fetchTasks(),
        }
      )
    } catch (error) {
      // Error already handled by useApi
      throw error
    }
  }, [execute, fetchTasks])

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  }
}
