import { NextRequest, NextResponse } from 'next/server';
import { getSession, ADMIN_SESSION_COOKIE_NAME, USER_SESSION_COOKIE_NAME, SessionData, UserSessionData } from '@kolbo/auth';

export async function GET(request: NextRequest) {
  try {
    // Check admin session first
    const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    if (adminToken) {
      const sessionData = await getSession(adminToken);
      if (sessionData && sessionData.sessionType === 'admin') {
        const adminSession = sessionData as SessionData;
        return NextResponse.json({
          user: {
            id: adminSession.id,
            email: adminSession.email,
            displayName: adminSession.displayName,
            role: adminSession.role,
            sessionType: 'admin',
          },
        });
      }
    }

    // Check user session
    const userToken = request.cookies.get(USER_SESSION_COOKIE_NAME)?.value;
    if (userToken) {
      const sessionData = await getSession(userToken);
      if (sessionData && sessionData.sessionType === 'user') {
        const userSession = sessionData as UserSessionData;
        return NextResponse.json({
          user: {
            id: userSession.id,
            email: userSession.email,
            displayName: userSession.name,
            role: 'channel_owner',
            sessionType: 'user',
          },
        });
      }
    }

    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
