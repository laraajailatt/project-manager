import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { apiSuccess, handleApiError } from '@/lib/api-response'
import { createApiError } from '@/lib/api-error'

const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
})

// GET /api/projects - Get all projects for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      throw createApiError(401, 'Authentication required', 'UNAUTHORIZED')
    }

    const projects = await db.project.findMany({
      where: { userId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return apiSuccess({ projects }, 'Projects retrieved successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      throw createApiError(401, 'Authentication required', 'UNAUTHORIZED')
    }

    const body = await request.json()
    const { title, description } = createProjectSchema.parse(body)

    const project = await db.project.create({
      data: {
        title,
        description,
        userId,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    })

    return apiSuccess({ project }, 'Project created successfully', 201)
  } catch (error) {
    return handleApiError(error)
  }
}