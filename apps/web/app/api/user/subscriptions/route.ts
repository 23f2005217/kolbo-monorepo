import { NextRequest, NextResponse } from 'next/server';
import { getSession, USER_SESSION_COOKIE_NAME, UserSessionData } from "@kolbo/auth";
import prisma from "@kolbo/database";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(USER_SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionData = await getSession(token);
    if (!sessionData || sessionData.sessionType !== 'user') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userSession = sessionData as UserSessionData;

    const subscriptions = await prisma.userSubscription.findMany({
      where: {
        userId: userSession.id,
        status: 'active',
      },
      include: {
        subsite: {
          select: {
            name: true,
            slug: true,
            monthlyPrice: true,
            thumbnailStorageBucket: true,
            thumbnailStoragePath: true,
          }
        },
        bundle: {
          select: {
            name: true,
            price: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('[API Subscriptions] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
