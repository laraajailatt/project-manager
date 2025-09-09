import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { TaskStatus } from '@prisma/client'
import { apiSuccess, handleApiError } from '@/lib/api-response'
import { createApiError } from '@/lib/api-error'

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long').optional(),
  description: z.string().max(500, 'Description is too long').optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  dueDate: z.string().datetime().optional().nullable(),
})

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      throw createApiError(401, 'Authentication required', 'UNAUTHORIZED')
    }

    if (!params.id) {
      throw createApiError(400, 'Task ID is required', 'INVALID_TASK_ID')
    }

    const task = await db.task.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!task) {
      throw createApiError(404, 'Task not found', 'TASK_NOT_FOUND')
    }

    return apiSuccess({ task }, 'Task retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/tasks/[id] - Update a task 
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      throw createApiError(401, 'Authentication required', 'UNAUTHORIZED')
    }

    if (!params.id) {
      throw createApiError(400, 'Task ID is required', 'INVALID_TASK_ID')
    }

    const body = await request.json()
    const updateData = updateTaskSchema.parse(body)

    // Prepare update data
    const taskUpdateData: Record<string, unknown> = {}
    if (updateData.title !== undefined) taskUpdateData.title = updateData.title
    if (updateData.description !== undefined) taskUpdateData.description = updateData.description
    if (updateData.status !== undefined) taskUpdateData.status = updateData.status
    if (updateData.dueDate !== undefined) {
      taskUpdateData.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null
    }

    // Single query: update only if task exists and belongs to user
    // This will throw a Prisma error if no records match the where condition
    const task = await db.task.updateMany({
      where: { 
        id: params.id,
        userId 
      },
      data: taskUpdateData,
    })

    // Check if any records were updated
    if (task.count === 0) {
      throw createApiError(404, 'Task not found', 'TASK_NOT_FOUND')
    }

    // Fetch the updated task with relations for response
    const updatedTask = await db.task.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return apiSuccess({ task: updatedTask }, 'Task updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/tasks/[id] - Delete a task (optimized single-query approach)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      throw createApiError(401, 'Authentication required', 'UNAUTHORIZED')
    }

    if (!params.id) {
      throw createApiError(400, 'Task ID is required', 'INVALID_TASK_ID')
    }

    // Single query: delete only if task exists and belongs to user
    const deletedTask = await db.task.deleteMany({
      where: {
        id: params.id,
        userId,
      },
    })

    // Check if any records were deleted
    if (deletedTask.count === 0) {
      throw createApiError(404, 'Task not found', 'TASK_NOT_FOUND')
    }

    return apiSuccess({}, 'Task deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
