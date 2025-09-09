export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function createApiError(statusCode: number, message: string, code?: string): ApiError {
  return new ApiError(statusCode, message, code)
}
