import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { TaskStatus } from '@prisma/client'
import { apiSuccess, handleApiError } from '@/lib/api-response'
import { createApiError } from '@/lib/api-error'

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  projectId: z.string().min(1, 'Project ID is required'),
  status: z.nativeEnum(TaskStatus).optional(),
  dueDate: z.string().datetime().optional(),
})

const filterSchema = z.object({
  projectId: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
})

// GET /api/tasks - Get tasks with optional filtering
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      throw createApiError(401, 'Authentication required', 'UNAUTHORIZED')
    }

    const { searchParams } = new URL(request.url)
    const filters = filterSchema.parse({
      projectId: searchParams.get('projectId') || undefined,
      status: searchParams.get('status') || undefined,
      dueDateFrom: searchParams.get('dueDateFrom') || undefined,
      dueDateTo: searchParams.get('dueDateTo') || undefined,
    })

    const whereClause: Record<string, unknown> = { userId }

    if (filters.projectId) {
      whereClause.projectId = filters.projectId
    }

    if (filters.status) {
      whereClause.status = filters.status
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
      const dueDateFilter: Record<string, Date> = {}
      if (filters.dueDateFrom) {
        dueDateFilter.gte = new Date(filters.dueDateFrom)
      }
      if (filters.dueDateTo) {
        dueDateFilter.lte = new Date(filters.dueDateTo)
      }
      whereClause.dueDate = dueDateFilter
    }

    const tasks = await db.task.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return apiSuccess({ tasks }, 'Tasks retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      throw createApiError(401, 'Authentication required', 'UNAUTHORIZED')
    }

    const body = await request.json()
    const { title, description, projectId, status, dueDate } = createTaskSchema.parse(body)

    // Verify that the project belongs to the user
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    })

    if (!project) {
      throw createApiError(404, 'Project not found or access denied', 'PROJECT_NOT_FOUND')
    }

    const task = await db.task.create({
      data: {
        title,
        description,
        projectId,
        userId,
        status: status || TaskStatus.TODO,
        dueDate: dueDate ? new Date(dueDate) : null,
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

    return apiSuccess({ task }, 'Task created successfully', 201)
  } catch (error) {
    return handleApiError(error)
  }
}
