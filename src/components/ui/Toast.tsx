'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { toastManager, Toast as ToastType } from '@/lib/toast'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

interface ToastItemProps {
  toast: ToastType
  onClose: (id: string) => void
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const Icon = toastIcons[toast.type]

  return (
    <div
      className={cn(
        'flex items-start p-4 rounded-lg border shadow-lg transition-all duration-300',
        'transform translate-x-0 opacity-100',
        toastStyles[toast.type]
      )}
    >
      <Icon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-sm opacity-90">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-3 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastType[]>([])

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts)
    return unsubscribe
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={toastManager.remove.bind(toastManager)}
        />
      ))}
    </div>
  )
}
