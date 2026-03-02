import { NextRequest, NextResponse } from 'next/server';
import {
  validateAdminCredentials,
  createSession,
  ADMIN_SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from '@kolbo/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const sessionData = await validateAdminCredentials(email, password);

    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await createSession(sessionData);

    const response = NextResponse.json({
      user: {
        id: sessionData.id,
        email: sessionData.email,
        displayName: sessionData.displayName,
        role: sessionData.role,
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
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
