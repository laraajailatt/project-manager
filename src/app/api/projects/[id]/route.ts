import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { apiSuccess, handleApiError } from '@/lib/api-response'
import { createApiError } from '@/lib/api-error'

const updateProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long').optional(),
  description: z.string().max(500, 'Description is too long').optional(),
})

// GET /api/projects/[id] - Get a specific project with its tasks
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
      throw createApiError(400, 'Project ID is required', 'INVALID_PROJECT_ID')
    }

    const project = await db.project.findFirst({
      where: {
        id: params.id,
        userId,
      },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { tasks: true },
        },
      },
    })

    if (!project) {
      throw createApiError(404, 'Project not found', 'PROJECT_NOT_FOUND')
    }

    return apiSuccess({ project }, 'Project retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/projects/[id] - Update a project
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
      throw createApiError(400, 'Project ID is required', 'INVALID_PROJECT_ID')
    }

    const body = await request.json()
    const updateData = updateProjectSchema.parse(body)

    // Single query: update only if project exists and belongs to user
    const project = await db.project.updateMany({
      where: {
        id: params.id,
        userId,
      },
      data: updateData,
    })

    // Check if any records were updated
    if (project.count === 0) {
      throw createApiError(404, 'Project not found', 'PROJECT_NOT_FOUND')
    }

    // Fetch the updated project with relations for response
    const updatedProject = await db.project.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    })

    return apiSuccess({ project: updatedProject }, 'Project updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/projects/[id] - Delete a project 
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
      throw createApiError(400, 'Project ID is required', 'INVALID_PROJECT_ID')
    }

    // Single query: delete only if project exists and belongs to user
    const deletedProject = await db.project.deleteMany({
      where: {
        id: params.id,
        userId,
      },
    })

    // Check if any records were deleted
    if (deletedProject.count === 0) {
      throw createApiError(404, 'Project not found', 'PROJECT_NOT_FOUND')
    }

    return apiSuccess({}, 'Project deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
