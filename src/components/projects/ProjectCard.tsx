'use client'

import React from 'react'
import Link from 'next/link'
import { FolderOpen, Calendar, Edit, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Project } from '@/hooks/useProjects'

export interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit(project)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete(project)
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FolderOpen className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="hover:text-indigo-600 transition-colors"
                >
                  {project.title}
                </Link>
              </h3>
              <p className="text-sm text-gray-500">
                {project._count.tasks} task{project._count.tasks !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={handleEdit}
              className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
              title="Edit project"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
              title="Delete project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {project.description && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
            {project.description}
          </p>
        )}
        
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          Updated {formatDate(project.updatedAt)}
        </div>
      </div>
    </div>
  )
}
