import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get('session')?.value

  // LOGGING: This will show in your terminal so we know it's working
  console.log(`[Middleware] Checking path: ${path}`)

  // 1. DEFINE PUBLIC PATHS
  // These are pages that should NEVER redirect users to login
  const publicPaths = ['/', '/login', '/register']

  // 2. CHECK: Is the user on a public path?
  if (publicPaths.includes(path)) {
    // If yes, STOP. Do not redirect. Just let the page load.
    return NextResponse.next()
  }

  // 3. CHECK: Is the user trying to access Dashboard?
  if (path.startsWith('/dashboard')) {
    // If no token, THEN redirect to login
    if (!token) {
      console.log(`[Middleware] No token found. Redirecting to Login.`)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 4. Default: Allow everything else
  return NextResponse.next()
}

export const config = {
  // Use this specific matcher to ignore internal Next.js files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}