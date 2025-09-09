'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Task, CreateTaskData, UpdateTaskData } from '@/hooks/useTasks'

const statusOptions = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
]

export interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>
  task?: Task | null
  projectId: string
  loading?: boolean
}

export function TaskForm({
  isOpen,
  onClose,
  onSubmit,
  task,
  projectId,
  loading = false,
}: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO' as 'TODO' | 'IN_PROGRESS' | 'DONE',
    startDate: '',
    dueDate: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!task

  // Initialize form data when task changes
  React.useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status,
        startDate: task.createdAt ? new Date(task.createdAt).toISOString().split('T')[0] : '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      })
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        startDate: new Date().toISOString().split('T')[0], // Default to today
        dueDate: '',
      })
    }
  }, [task, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less'
    }
    if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        ...(isEditing ? {} : { projectId }),
        dueDate: formData.dueDate || undefined,
        // Note: startDate is typically the createdAt field, so we don't update it for existing tasks
      }
      
      await onSubmit(submitData)
      handleClose()
    } catch {
      // Error is handled by the hook
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      status: 'TODO',
      startDate: '',
      dueDate: '',
    })
    setErrors({})
    onClose()
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? task?.title : 'Create New Task'}
      size="md"
    >

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Task Title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            error={errors.title}
            placeholder="Enter task title"
            required
            maxLength={100}
          />

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            options={statusOptions}
          />
        </div>

        <Textarea
          label="Description (optional)"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          error={errors.description}
          placeholder="Enter task description"
          rows={3}
          maxLength={500}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            helperText={isEditing ? "Created date from database" : "Task creation date"}
          />

          <Input
            label="Due Date (optional)"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {isEditing ? 'Update' : 'Create'} Task
          </Button>
        </div>
      </form>
    </Modal>
  )
}
