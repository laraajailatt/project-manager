'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Plus, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { TaskForm } from '@/components/tasks/TaskForm'
import { KanbanBoard } from '@/components/projects/KanbanBoard'
import { useProject, ProjectTask } from '@/hooks/useProject'
import { useTasks, CreateTaskData, UpdateTaskData } from '@/hooks/useTasks'

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const { project, loading: projectLoading, refetch: refetchProject } = useProject(projectId)
  const { createTask, updateTask, deleteTask } = useTasks()
  
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const handleCreateTask = async (data: CreateTaskData) => {
    setFormLoading(true)
    try {
      await createTask(data)
      await refetchProject()
      setShowTaskForm(false)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateTask = async (data: UpdateTaskData) => {
    if (!editingTask) return
    
    setFormLoading(true)
    try {
      await updateTask(editingTask.id, data)
      await refetchProject()
      setShowTaskForm(false)
      setEditingTask(null)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteTask = async (task: ProjectTask) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${task.title}"?`)
    
    if (confirmed) {
      await deleteTask(task.id)
      await refetchProject()
    }
  }

  const handleEditTask = (task: ProjectTask) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleCloseForm = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus })
    await refetchProject()
  }

  const handleFormSubmit = async (data: CreateTaskData | UpdateTaskData) => {
    if (editingTask) {
      await handleUpdateTask(data as UpdateTaskData)
    } else {
      await handleCreateTask(data as CreateTaskData)
    }
  }

  if (projectLoading) {
    return <PageLoadingSpinner text="Loading project..." />
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Project not found</h3>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
          className="mt-4"
        >
          Go back to dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            {project.description && (
              <p className="text-gray-600">{project.description}</p>
            )}
          </div>
        </div>
        <Button onClick={() => setShowTaskForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        task={editingTask}
        projectId={projectId}
        loading={formLoading}
      />

      {/* Kanban Board */}
      <KanbanBoard
        tasks={project.tasks}
        onTaskStatusChange={handleTaskStatusChange}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  )
}