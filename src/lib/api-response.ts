import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { ApiError } from './api-error'

export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
  details?: unknown
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

export function apiSuccess<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  )
}

export function apiError(
  error: string | Error | ApiError | ZodError,
  status?: number,
  code?: string
): NextResponse<ApiErrorResponse> {
  let errorMessage: string
  let errorStatus: number
  let errorCode: string | undefined
  let errorDetails: unknown

  if (error instanceof ZodError) {
    errorMessage = 'Validation failed'
    errorStatus = 400
    errorCode = 'VALIDATION_ERROR'
    errorDetails = error.issues
  } else if (error instanceof ApiError) {
    errorMessage = error.message
    errorStatus = error.statusCode
    errorCode = error.code
  } else if (error instanceof Error) {
    errorMessage = error.message
    errorStatus = status || 500
    errorCode = code
  } else {
    errorMessage = error
    errorStatus = status || 500
    errorCode = code
  }

  const response: ApiErrorResponse = {
    success: false,
    error: errorMessage,
  }
  
  if (errorCode) {
    response.code = errorCode
  }
  
  if (errorDetails && typeof errorDetails === 'object') {
    response.details = errorDetails
  }

  return NextResponse.json(response, { status: errorStatus })
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error)

  if (error instanceof ZodError) {
    return apiError(error)
  }

  if (error instanceof ApiError) {
    return apiError(error)
  }

  if (error instanceof Error) {
    return apiError(error, 500, 'INTERNAL_SERVER_ERROR')
  }

  return apiError('An unexpected error occurred', 500, 'UNKNOWN_ERROR')
}
