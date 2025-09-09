'use client'

import React from 'react'
import { Calendar, Edit, Trash2 } from 'lucide-react'
import { formatDate, isOverdue, cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ProjectTask } from '@/hooks/useProject'

export interface TaskCardProps {
  task: ProjectTask
  isDragging?: boolean
  onEdit?: (task: ProjectTask) => void
  onDelete?: (task: ProjectTask) => void
}

export function TaskCard({ task, isDragging = false, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const overdue = isOverdue(task.dueDate || null)

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit?.(task)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete?.(task)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-white p-4 rounded-lg shadow-sm border cursor-grab active:cursor-grabbing group',
        isDragging && 'opacity-50',
        overdue && 'border-red-200'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
          )}
          {task.dueDate && (
            <div className={cn(
              'flex items-center text-xs',
              overdue ? 'text-red-600' : 'text-gray-500'
            )}>
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(task.dueDate)}
              {overdue && ' (Overdue)'}
            </div>
          )}
        </div>
        
        {(onEdit || onDelete) && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 ml-2">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="text-gray-400 hover:text-gray-600 p-1 bg-white rounded shadow"
                title="Edit task"
              >
                <Edit className="h-3 w-3" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-600 p-1 bg-white rounded shadow"
                title="Delete task"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
