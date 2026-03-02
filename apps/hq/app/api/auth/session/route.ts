import { NextRequest, NextResponse } from 'next/server';
import { getSession, ADMIN_SESSION_COOKIE_NAME, SessionData } from '@kolbo/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sessionData = await getSession(token);

    if (!sessionData || sessionData.sessionType !== 'admin') {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const adminSession = sessionData as SessionData;

    return NextResponse.json({
      user: {
        id: adminSession.id,
        email: adminSession.email,
        displayName: adminSession.displayName,
        role: adminSession.role,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
