import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Debug flag - set to true to bypass auth checks (for troubleshooting)
const BYPASS_AUTH = true; // TEMPORARY - SET BACK TO FALSE AFTER DEBUGGING

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/upload', '/teacher-portal'];
  const authRoutes = ['/login', '/signup'];
  const debugRoutes = ['/debug'];
  const path = req.nextUrl.pathname;

  // Always allow access to debug routes
  if (debugRoutes.some(route => path.startsWith(route))) {
    return res;
  }

  // If bypass auth is enabled, skip all authentication checks
  if (BYPASS_AUTH) {
    return res;
  }

  // If trying to access a protected route without being logged in
  if (protectedRoutes.some(route => path.startsWith(route)) && !session) {
    console.log(`Redirecting from ${path} to login: No valid session found`);
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectedFrom', path);
    return NextResponse.redirect(redirectUrl);
  }

  // If already logged in and trying to access auth routes
  if (session && authRoutes.some(route => path === route)) {
    console.log(`Redirecting from ${path} to dashboard: User already logged in`);
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/upload/:path*',
    '/teacher-portal/:path*',
    // Auth routes
    '/login',
    '/signup',
    // Debug routes
    '/debug',
    // Create teacher account route
    '/create-teacher',
  ],
}; 