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

    // === DIAGNOSTIC: Log user's raw subscriptions ===
    const userSubs = await prisma.userSubscription.findMany({
      where: { userId, status: 'active' },
      include: { subsite: true, bundle: true, subsiteSubscriptionPlan: true },
    });
    console.log('[ENTITLEMENT DEBUG] userId:', userId);
    console.log('[ENTITLEMENT DEBUG] User active subscriptions:', JSON.stringify(userSubs.map(s => ({
      id: s.id,
      subsiteId: s.subsiteId,
      bundleId: s.bundleId,
      subsiteSubscriptionPlanId: s.subsiteSubscriptionPlanId,
      subsiteName: s.subsite?.name,
      subsiteSlug: s.subsite?.slug,
      bundleName: s.bundle?.name,
      sspSubsiteId: s.subsiteSubscriptionPlan?.subsiteId,
      sspPlanId: s.subsiteSubscriptionPlan?.subscriptionPlanId,
    })), null, 2));

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { 
        id: true, 
        isFree: true, 
        subsiteId: true,
        subsite: { select: { name: true, slug: true } },
        subscriptionPlans: {
          select: { subscriptionPlanId: true }
        }
      },
    });

    console.log('[ENTITLEMENT DEBUG] Video:', JSON.stringify({
      id: video?.id,
      isFree: video?.isFree,
      subsiteId: video?.subsiteId,
      subsiteName: video?.subsite?.name,
      subsiteSlug: video?.subsite?.slug,
      planIds: video?.subscriptionPlans?.map(p => p.subscriptionPlanId),
    }, null, 2));

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

    const planIds = video.subscriptionPlans.map(p => p.subscriptionPlanId);
    
    // Also find all plans that cover this video's subsite
    const subsitePlanIds = video.subsiteId ? (await prisma.subsiteSubscriptionPlan.findMany({
      where: { subsiteId: video.subsiteId },
      select: { subscriptionPlanId: true }
    })).map(p => p.subscriptionPlanId) : [];

    const allRelevantPlanIds = Array.from(new Set([...planIds, ...subsitePlanIds]));
    console.log('[ENTITLEMENT DEBUG] planIds:', planIds);
    console.log('[ENTITLEMENT DEBUG] subsitePlanIds:', subsitePlanIds);
    console.log('[ENTITLEMENT DEBUG] allRelevantPlanIds:', allRelevantPlanIds);

    // Build the OR conditions
    const subscriptionConditions: any[] = [
      // 1. Direct subsite link
      ...(video.subsiteId ? [{ subsiteId: video.subsiteId }] : []),
      
      // 2. Direct bundle link
      ...(video.subsiteId ? [{ 
        bundle: {
          bundleSubsites: {
            some: { subsiteId: video.subsiteId }
          }
        }
      }] : []),
      
      // 3. Link via SubsiteSubscriptionPlan relation
      ...(video.subsiteId ? [{
        subsiteSubscriptionPlan: {
          subsiteId: video.subsiteId
        }
      }] : []),
      
      // 4. Link via SubscriptionPlan directly (in case subsiteSubscriptionPlanId stores planId)
      ...(allRelevantPlanIds.length > 0 ? [{
        subsiteSubscriptionPlanId: { in: allRelevantPlanIds }
      }] : []),
      
      // 5. Relation check via plan IDs
      ...(allRelevantPlanIds.length > 0 ? [{
        subsiteSubscriptionPlan: {
          subscriptionPlanId: { in: allRelevantPlanIds }
        }
      }] : [])
    ];

    console.log('[ENTITLEMENT DEBUG] OR conditions count:', subscriptionConditions.length);

    // If no subscription conditions can be built, skip subscription check
    let activeSubscription = null;
    if (subscriptionConditions.length > 0) {
      activeSubscription = await prisma.userSubscription.findFirst({
        where: {
          userId,
          status: 'active',
          OR: subscriptionConditions,
        },
        include: {
          subsite: true,
          bundle: true,
          subsiteSubscriptionPlan: {
            include: {
              subsite: true,
              subscriptionPlan: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    console.log('[ENTITLEMENT DEBUG] Matched subscription:', activeSubscription ? {
      id: activeSubscription.id,
      subsiteId: activeSubscription.subsiteId,
      subsiteName: activeSubscription.subsite?.name,
    } : 'NONE');

    if (activeSubscription) {
      const sourceName = 
        activeSubscription.subsite?.name || 
        activeSubscription.bundle?.name || 
        activeSubscription.subsiteSubscriptionPlan?.subsite?.name ||
        activeSubscription.subsiteSubscriptionPlan?.subscriptionPlan?.name ||
        'Subscription';
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
