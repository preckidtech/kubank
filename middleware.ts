import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Get the session cookie
  const session = request.cookies.get("session")?.value;

  // 2. Determine where the user is
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  // 3. PROTECT DASHBOARD: 
  // If user tries to go to Dashboard WITHOUT a session, send them to Login.
  if (isDashboard && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. STOP THE LOOP:
  // We explicitly DO NOT redirect users away from /login here.
  // This ensures that if your cookie is invalid, you don't get bounced back and forth.
  
  return NextResponse.next();
}

// Configure which paths this middleware runs on
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};