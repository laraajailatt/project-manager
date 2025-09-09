'use client'

import React, { useState } from 'react'
import { Plus, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { useProjects, Project } from '@/hooks/useProjects'

export default function DashboardPage() {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects()
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const handleCreateProject = async (data: { title: string; description?: string }) => {
    setFormLoading(true)
    try {
      await createProject(data)
      setShowForm(false)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateProject = async (data: { title?: string; description?: string }) => {
    if (!editingProject) return
    
    setFormLoading(true)
    try {
      await updateProject(editingProject.id, data)
      setShowForm(false)
      setEditingProject(null)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteProject = async (project: Project) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"? This will also delete all associated tasks.`
    )
    
    if (confirmed) {
      await deleteProject(project.id)
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingProject(null)
  }

  const handleFormSubmit = async (data: { title: string; description?: string }) => {
    if (editingProject) {
      await handleUpdateProject(data)
    } else {
      await handleCreateProject(data)
    }
  }

  if (loading) {
    return <PageLoadingSpinner text="Loading projects..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your projects and tasks</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Project Form Modal */}
      <ProjectForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        project={editingProject}
        loading={formLoading}
      />

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No projects"
          description="Get started by creating a new project."
          action={{
            label: 'New Project',
            onClick: () => setShowForm(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  )
}
