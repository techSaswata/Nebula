import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes outside the middleware function to prevent recreation on each request
const PUBLIC_ROUTES = [
  '/',
  '/home',
  '/login',
  '/register',
  '/courses',
  '/courses/[id]'
]

// Create regex patterns for dynamic routes once
const DYNAMIC_ROUTE_PATTERNS = PUBLIC_ROUTES.map(route => {
  if (route.includes('[')) {
    const routePattern = route.replace(/\[.*?\]/g, '[^/]+')
    return new RegExp(`^${routePattern}$`)
  }
  return null
})

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the current path is public
  const isPublicRoute = PUBLIC_ROUTES.some((route, index) => {
    if (route.includes('[')) {
      return DYNAMIC_ROUTE_PATTERNS[index]?.test(req.nextUrl.pathname)
    }
    return route === req.nextUrl.pathname
  })

  // If user is authenticated
  if (session) {
    // Redirect to dashboard if trying to access login/register
    if (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    // Allow access to all routes including dashboard
    return res
  }

  // If user is not authenticated and trying to access protected routes
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  return res
}

// Optimize matcher to be more specific
export const config = {
  matcher: [
    '/',
    '/home',
    '/login',
    '/register',
    '/dashboard/:path*',
    '/courses/:path*'
  ]
} 