'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { Project } from '@/hooks/useProjects'

export interface ProjectFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description?: string }) => Promise<void>
  project?: Project | null
  loading?: boolean
}

export function ProjectForm({
  isOpen,
  onClose,
  onSubmit,
  project,
  loading = false,
}: ProjectFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditing = !!project

  // Initialize form data when project changes
  React.useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
      })
    } else {
      setFormData({
        title: '',
        description: '',
      })
    }
  }, [project, isOpen])

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
      await onSubmit(formData)
      handleClose()
    } catch {
      // Error is handled by the hook
    }
  }

  const handleClose = () => {
    setFormData({ title: '', description: '' })
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
      title={isEditing ? 'Edit Project' : 'Create New Project'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          placeholder="Enter project title"
          required
          maxLength={100}
        />

        <Textarea
          label="Description (optional)"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          error={errors.description}
          placeholder="Enter project description"
          rows={3}
          maxLength={500}
        />

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
            {isEditing ? 'Update' : 'Create'} Project
          </Button>
        </div>
      </form>
    </Modal>
  )
}
