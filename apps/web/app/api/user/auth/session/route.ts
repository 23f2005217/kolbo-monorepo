import { NextRequest, NextResponse } from 'next/server';
import { getSession, USER_SESSION_COOKIE_NAME, UserSessionData } from "@kolbo/auth";
import prisma from "@kolbo/database";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(USER_SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sessionData = await getSession(token);

    if (!sessionData || sessionData.sessionType !== 'user') {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const userSession = sessionData as UserSessionData;

    // Check if user has any active subscriptions
    const subCount = await prisma.userSubscription.count({
      where: {
        userId: userSession.id,
        status: 'active'
      }
    });

    return NextResponse.json({
      user: {
        id: userSession.id,
        email: userSession.email,
        name: userSession.name,
        hasSubscriptions: subCount > 0,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
