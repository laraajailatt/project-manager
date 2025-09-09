'use client'

import { useState, useCallback } from 'react'
import { toast } from '@/lib/toast'

export interface UseApiOptions {
  onSuccess?: (data: unknown) => void
  onError?: (error: string) => void
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
  skipErrorToast?: boolean
}

export interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T = unknown>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (
    apiCall: () => Promise<Response>,
    options: UseApiOptions = {}
  ) => {
    const {
      onSuccess,
      onError,
      showSuccessToast = false,
      showErrorToast = true,
      skipErrorToast = false,
      successMessage,
    } = options

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await apiCall()
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(errorData.error || 'Request failed')
      }

      const data = await response.json()
      
      setState({ data: data.data || data, loading: false, error: null })

      if (showSuccessToast) {
        toast.success(successMessage || 'Operation completed successfully')
      }

      onSuccess?.(data.data || data)
      return data.data || data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))

      if (showErrorToast && !skipErrorToast) {
        toast.error('Error', errorMessage)
      }

      onError?.(errorMessage)
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}
