'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { TaskCard } from '@/components/tasks/TaskCard'
import { ProjectTask } from '@/hooks/useProject'

const statusColumns = [
  { id: 'TODO', title: 'To Do', color: 'bg-gray-100' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'DONE', title: 'Done', color: 'bg-green-100' },
] as const

type TaskStatus = typeof statusColumns[number]['id']

interface DroppableColumnProps {
  id: string
  title: string
  color: string
  children: React.ReactNode
  count: number
}

function DroppableColumn({ id, title, color, children, count }: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({ id })

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className={cn('p-4 border-b border-gray-100', color)}>
        <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
          {title} ({count})
        </h3>
      </div>
      <div ref={setNodeRef} className="bg-gradient-to-b from-gray-50 to-white p-4 flex-1 min-h-[400px]">
        {children}
      </div>
    </div>
  )
}

export interface KanbanBoardProps {
  tasks: ProjectTask[]
  onTaskStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>
  onEditTask?: (task: ProjectTask) => void
  onDeleteTask?: (task: ProjectTask) => void
}

export function KanbanBoard({ 
  tasks, 
  onTaskStatusChange, 
  onEditTask, 
  onDeleteTask 
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    await onTaskStatusChange(taskId, newStatus)
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status)
  }

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Vertical separators for desktop */}
          <div className="hidden md:block absolute left-1/3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
          <div className="hidden md:block absolute left-2/3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
          
          {statusColumns.map((column) => {
            const columnTasks = getTasksByStatus(column.id)
            return (
              <DroppableColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                count={columnTasks.length}
              >
                <SortableContext
                  items={columnTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DroppableColumn>
            )
          })}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}
