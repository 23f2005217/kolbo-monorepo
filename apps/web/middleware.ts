import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const USER_SESSION_COOKIE_NAME = 'kolbo_user_session';

// Public routes that don't require authentication
const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/browse',
  '/search',
  '/',
];

// Protected routes that always require authentication
const PROTECTED_PATHS = [
  '/watch',
  '/account',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public API auth routes through
  if (
    pathname.startsWith('/api/user/auth/') ||
    pathname === '/api/user/login' ||
    pathname === '/api/user/signup'
  ) {
    return NextResponse.next();
  }

  // Allow static assets and other API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const userToken = request.cookies.get(USER_SESSION_COOKIE_NAME)?.value;

  // Check if the path is explicitly protected
  const isProtected =
    pathname.startsWith('/account') ||
    // /watch/[id]/play requires auth, but /watch/[id] is public
    /^\/watch\/[^/]+\/play/.test(pathname);

  if (isProtected && !userToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
