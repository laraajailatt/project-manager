import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Configuration for demo mode
const DEMO_CONFIG = {
  enabled: process.env.NODE_ENV === 'development',
  userId: '507f1f77bcf86cd799439011', // Valid MongoDB ObjectId format
  userEmail: 'demo@example.com',
  userName: 'Lara Ajailat', // Updated to match create-demo-user.js
}

// Rate limiting (simple in-memory store for demo) - More generous limits
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = {
  maxRequests: 1000, // Much higher limit for development
  windowMs: 15 * 60 * 1000, // 15 minutes
}

function checkRateLimit(ip: string): boolean {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  const now = Date.now()
  const record = rateLimitStore.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT.windowMs })
    return true
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return false
  }

  record.count++
  return true
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Apply middleware only to API routes
  if (pathname.startsWith('/api/')) {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests', 
          code: 'RATE_LIMIT_EXCEEDED' 
        },
        { status: 429 }
      )
    }

    // Demo user authentication simulation
    if (DEMO_CONFIG.enabled) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', DEMO_CONFIG.userId)
      requestHeaders.set('x-user-email', DEMO_CONFIG.userEmail)
      requestHeaders.set('x-user-name', DEMO_CONFIG.userName)
      
      // Add CORS headers for development
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })

      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

      return response
    }

    // In production, you would validate actual authentication tokens here
    const authToken = request.headers.get('authorization')
    if (!authToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required', 
          code: 'UNAUTHORIZED' 
        },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}
