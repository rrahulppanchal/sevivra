import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/signin', '/auth/signup', '/', '/api/auth/login', '/api/auth/register']
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // If accessing a public route, allow it
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // If no token and trying to access protected route, redirect to signin
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Verify token
  try {
    const payload = verifyToken(token)
    
    // Add user info to request headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-role', payload.role)
    requestHeaders.set('x-user-email', payload.email)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    // Invalid token, redirect to signin
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('redirect', request.nextUrl.pathname)
    const response = NextResponse.redirect(signInUrl)
    response.cookies.delete('token')
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

