'use client'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

class ToastManager {
  private toasts: Toast[] = []
  private listeners: ((toasts: Toast[]) => void)[] = []

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener([...this.toasts]))
  }

  add(toast: Omit<Toast, 'id'>): string {
    const id = this.generateId()
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    }

    this.toasts.push(newToast)
    this.notify()

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.remove(id)
      }, newToast.duration)
    }

    return id
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter((toast) => toast.id !== id)
    this.notify()
  }

  clear(): void {
    this.toasts = []
    this.notify()
  }

  subscribe(listener: (toasts: Toast[]) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  getToasts(): Toast[] {
    return [...this.toasts]
  }
}

export const toastManager = new ToastManager()

// Convenience methods
export const toast = {
  success: (title: string, description?: string) =>
    toastManager.add({ type: 'success', title, description }),
  error: (title: string, description?: string) =>
    toastManager.add({ type: 'error', title, description }),
  warning: (title: string, description?: string) =>
    toastManager.add({ type: 'warning', title, description }),
  info: (title: string, description?: string) =>
    toastManager.add({ type: 'info', title, description }),
}
