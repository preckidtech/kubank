import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// FIXED: Renamed function from 'middleware' to 'proxy'
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get('session')?.value

  console.log(`[Proxy] Checking path: ${path}`)

  // 1. DEFINE PUBLIC PATHS
  const publicPaths = ['/', '/login', '/register']

  // 2. REDIRECT LOGGED-IN USERS AWAY FROM LOGIN/REGISTER
  if (token && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3. ALLOW PUBLIC PATHS
  if (publicPaths.includes(path)) {
    return NextResponse.next()
  }

  // 4. PROTECT DASHBOARD PATHS
  if (path.startsWith('/dashboard')) {
    if (!token) {
      console.log(`[Proxy] No token found. Redirecting to Login.`)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

// Ensure the matcher is set to include the proxy
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}