import { NextRequest, NextResponse } from 'next/server';
import {
  validateAdminCredentials,
  validateUserCredentials,
  createSession,
  ADMIN_SESSION_COOKIE_NAME,
  USER_SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from '@kolbo/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // First try admin credentials
    const adminSession = await validateAdminCredentials(email, password);

    if (adminSession) {
      const token = await createSession(adminSession);

      const response = NextResponse.json({
        user: {
          id: adminSession.id,
          email: adminSession.email,
          displayName: adminSession.displayName,
          role: adminSession.role,
          sessionType: adminSession.sessionType,
        },
      });

      response.cookies.set(ADMIN_SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE,
      });

      return response;
    }

    // If not admin, try user credentials
    const userSession = await validateUserCredentials(email, password);

    if (userSession) {
      const token = await createSession(userSession);

      const response = NextResponse.json({
        user: {
          id: userSession.id,
          email: userSession.email,
          displayName: userSession.name,
          role: 'channel_owner',
          sessionType: userSession.sessionType,
        },
      });

      response.cookies.set(USER_SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE,
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
