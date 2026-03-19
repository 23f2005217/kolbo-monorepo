import { NextRequest, NextResponse } from 'next/server';
import prisma from "@kolbo/database";
import { getSession, USER_SESSION_COOKIE_NAME } from "@kolbo/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;

    const accessToken = request.cookies.get(USER_SESSION_COOKIE_NAME)?.value;

    if (!accessToken) {
      return NextResponse.json({
        hasAccess: false,
        entitlement: null,
        message: 'Not logged in',
      });
    }

    const sessionData = await getSession(accessToken);

    if (!sessionData || sessionData.sessionType !== 'user') {
      return NextResponse.json({
        hasAccess: false,
        entitlement: null,
        message: 'Invalid session',
      });
    }

    const userId = sessionData.id;

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { 
        id: true, 
        isFree: true, 
        subsiteId: true,
      },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (video.isFree) {
      return NextResponse.json({
        hasAccess: true,
        entitlement: {
          type: 'free',
          expiresAt: null,
        },
      });
    }

    // Check for active subscription covering this video's subsite
    if (video.subsiteId) {
      const activeSubscription = await prisma.userSubscription.findFirst({
        where: {
          userId,
          status: 'active',
          OR: [
            // Direct subsite subscription
            { subsiteId: video.subsiteId },
            // Bundle that includes this subsite
            { 
              bundle: {
                bundleSubsites: {
                  some: { subsiteId: video.subsiteId }
                }
              }
            },
          ]
        },
        include: {
          subsite: true,
          bundle: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (activeSubscription) {
        const sourceName = activeSubscription.subsite?.name || activeSubscription.bundle?.name || 'Subscription';
        return NextResponse.json({
          hasAccess: true,
          entitlement: {
            type: 'subscription',
            sourceName,
            expiresAt: activeSubscription.endsAt?.toISOString() || null,
            isPermanent: !activeSubscription.endsAt,
          },
        });
      }
    }

    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId,
        contentId: videoId,
        contentType: 'video',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!entitlement) {
      return NextResponse.json({
        hasAccess: false,
        entitlement: null,
        message: 'No entitlement found',
      });
    }

    const now = new Date();
    const isValid = now >= entitlement.startsAt &&
                   (!entitlement.expiresAt || now <= entitlement.expiresAt);

    if (!isValid) {
      return NextResponse.json({
        hasAccess: false,
        entitlement: {
          type: entitlement.entitlementType,
          expiresAt: entitlement.expiresAt?.toISOString() || null,
          expired: true,
        },
        message: 'Entitlement expired',
      });
    }

    let remainingHours = null;
    let remainingDays = null;

    if (entitlement.expiresAt) {
      const diffMs = entitlement.expiresAt.getTime() - now.getTime();
      remainingHours = Math.ceil(diffMs / (1000 * 60 * 60));
      remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json({
      hasAccess: true,
      entitlement: {
        type: entitlement.entitlementType,
        startsAt: entitlement.startsAt.toISOString(),
        expiresAt: entitlement.expiresAt?.toISOString() || null,
        remainingHours,
        remainingDays,
        isPermanent: !entitlement.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error checking entitlement:', error);
    return NextResponse.json(
      { error: 'Failed to check entitlement' },
      { status: 500 }
    );
  }
}
