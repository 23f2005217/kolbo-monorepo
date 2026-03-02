import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADS_SESSION_COOKIE_NAME = 'kolbo_ads_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === '/signin' ||
    pathname === '/signup' ||
    pathname === '/' ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADS_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    const signinUrl = new URL('/signin', request.url);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
