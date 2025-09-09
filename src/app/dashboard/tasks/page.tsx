'use client'

import React, { useState } from 'react'
import { Calendar, Filter, CheckSquare, Clock, AlertCircle } from 'lucide-react'
import { formatDate, isOverdue, cn } from '@/lib/utils'
import Link from 'next/link'
import { PageLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { useTasks } from '@/hooks/useTasks'

const statusOptions = [
  { value: 'ALL', label: 'All Tasks', icon: CheckSquare },
  { value: 'TODO', label: 'To Do', icon: Clock },
  { value: 'IN_PROGRESS', label: 'In Progress', icon: AlertCircle },
  { value: 'DONE', label: 'Done', icon: CheckSquare },
] as const

type StatusFilter = typeof statusOptions[number]['value']

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [dateFilter, setDateFilter] = useState<'ALL' | 'OVERDUE' | 'DUE_TODAY' | 'DUE_WEEK'>('ALL')
  
  const filters = statusFilter !== 'ALL' ? { status: statusFilter } : {}
  const { tasks, loading, updateTask } = useTasks(filters)

  const updateTaskStatus = async (taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    await updateTask(taskId, { status: newStatus })
  }

  const getFilteredTasks = () => {
    let filtered = tasks

    // Apply date filter
    if (dateFilter !== 'ALL') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

      filtered = tasks.filter(task => {
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())

        switch (dateFilter) {
          case 'OVERDUE':
            return dueDateOnly < today
          case 'DUE_TODAY':
            return dueDateOnly.getTime() === today.getTime()
          case 'DUE_WEEK':
            return dueDateOnly >= today && dueDateOnly <= weekFromNow
          default:
            return true
        }
      })
    }

    return filtered
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TODO':
        return <Clock className="h-4 w-4 text-gray-500" />
      case 'IN_PROGRESS':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'DONE':
        return <CheckSquare className="h-4 w-4 text-green-500" />
      default:
        return <CheckSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO':
        return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'DONE':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <PageLoadingSpinner text="Loading tasks..." />
  }

  const filteredTasks = getFilteredTasks()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
          <p className="text-gray-600">View and manage tasks across all projects</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={cn(
                      'inline-flex items-center px-3 py-2 rounded-full text-sm font-medium',
                      statusFilter === option.value
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'ALL', label: 'All' },
                { value: 'OVERDUE', label: 'Overdue' },
                { value: 'DUE_TODAY', label: 'Due Today' },
                { value: 'DUE_WEEK', label: 'Due This Week' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDateFilter(option.value as typeof dateFilter)}
                  className={cn(
                    'inline-flex items-center px-3 py-2 rounded-full text-sm font-medium',
                    dateFilter === option.value
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description={
            statusFilter !== 'ALL' || dateFilter !== 'ALL'
              ? 'Try adjusting your filters.'
              : 'Create a project and add some tasks to get started.'
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const overdue = isOverdue(task.dueDate)
            return (
              <div
                key={task.id}
                className={cn(
                  'bg-white rounded-lg shadow-sm border p-6',
                  overdue && 'border-red-200'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {task.title}
                      </h3>
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getStatusColor(task.status)
                      )}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1">
                          {task.status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <Link
                        href={`/dashboard/projects/${task.project.id}`}
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        {task.project.title}
                      </Link>
                      {task.dueDate && (
                        <div className={cn(
                          'flex items-center',
                          overdue ? 'text-red-600' : 'text-gray-500'
                        )}>
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(task.dueDate)}
                          {overdue && ' (Overdue)'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {task.status !== 'DONE' && (
                      <>
                        {task.status === 'TODO' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                            className="text-sm text-blue-600 hover:text-blue-500"
                          >
                            Start
                          </button>
                        )}
                        {task.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'DONE')}
                            className="text-sm text-green-600 hover:text-green-500"
                          >
                            Complete
                          </button>
                        )}
                      </>
                    )}
                    {task.status === 'DONE' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                        className="text-sm text-gray-600 hover:text-gray-500"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
