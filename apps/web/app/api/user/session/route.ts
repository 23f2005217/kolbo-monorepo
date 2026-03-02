import { NextRequest, NextResponse } from 'next/server';
import { getSession, USER_SESSION_COOKIE_NAME, UserSessionData } from "@kolbo/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(USER_SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const sessionData = await getSession(token);

    if (!sessionData || sessionData.sessionType !== 'user') {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const userSession = sessionData as UserSessionData;

    return NextResponse.json({
      user: {
        id: userSession.id,
        email: userSession.email,
        name: userSession.name,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

