import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_SESSION_COOKIE_NAME = 'kolbo_admin_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login and auth API routes through
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!adminToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
