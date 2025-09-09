import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'No due date'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function isOverdue(dueDate: Date | string | null | undefined): boolean {
  if (!dueDate) return false
  
  const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return dateObj < today
}
