import { NextRequest, NextResponse } from 'next/server';
import prisma from "@kolbo/database";

interface EnrichedEntitlement {
  id: string;
  userId: string;
  contentType: string;
  contentId: string;
  entitlementType: string;
  startsAt: Date;
  expiresAt: Date | null;
  maxSimultaneousStreams: number | null;
  stripeCustomerId: string | null;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  itemType: 'plan' | 'bundle' | 'channel' | 'unknown';
  description: string | null;
  price: number | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch entitlements with related data
    const entitlements = await prisma.entitlement.findMany({
      where: { userId },
      orderBy: { startsAt: 'desc' },
    });

    // Collect all content IDs to batch fetch related records
    const contentIds = entitlements.map(e => e.contentId);

    // Fetch all related records in parallel
    const [plans, bundles, channels] = await Promise.all([
      prisma.subscriptionPlan.findMany({
        where: { id: { in: contentIds } },
        select: {
          id: true,
          name: true,
          description: true,
          priceAmount: true,
          planType: true,
          tier: true,
          hasAds: true,
          maxDevices: true,
        },
      }),
      prisma.bundle.findMany({
        where: { id: { in: contentIds } },
        select: {
          id: true,
          name: true,
          description: true,
          priceAmount: true,
        },
      }),
      prisma.subsite.findMany({
        where: { id: { in: contentIds } },
        select: {
          id: true,
          name: true,
          description: true,
          monthlyPrice: true,
          category: true,
          slug: true,
        },
      }),
    ]);

    // Create lookup maps
    const planMap = new Map(plans.map(p => [p.id, p]));
    const bundleMap = new Map(bundles.map(b => [b.id, b]));
    const channelMap = new Map(channels.map(c => [c.id, c]));

    // Enrich entitlements with names and details
    const enrichedEntitlements: EnrichedEntitlement[] = [];
    
    for (const e of entitlements) {
      const plan = planMap.get(e.contentId);
      const bundle = bundleMap.get(e.contentId);
      const channel = channelMap.get(e.contentId);

      let enriched: EnrichedEntitlement;

      if (plan) {
        enriched = {
          id: e.id,
          userId: e.userId,
          contentType: e.contentType,
          contentId: e.contentId,
          entitlementType: e.entitlementType,
          startsAt: e.startsAt,
          expiresAt: e.expiresAt,
          maxSimultaneousStreams: e.maxSimultaneousStreams,
          stripeCustomerId: e.stripeCustomerId,
          stripeCheckoutSessionId: e.stripeCheckoutSessionId,
          stripePaymentIntentId: e.stripePaymentIntentId,
          stripeSubscriptionId: e.stripeSubscriptionId,
          stripePriceId: e.stripePriceId,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
          name: plan.name,
          itemType: 'plan',
          description: plan.description,
          price: plan.priceAmount,
        };
      } else if (bundle) {
        enriched = {
          id: e.id,
          userId: e.userId,
          contentType: e.contentType,
          contentId: e.contentId,
          entitlementType: e.entitlementType,
          startsAt: e.startsAt,
          expiresAt: e.expiresAt,
          maxSimultaneousStreams: e.maxSimultaneousStreams,
          stripeCustomerId: e.stripeCustomerId,
          stripeCheckoutSessionId: e.stripeCheckoutSessionId,
          stripePaymentIntentId: e.stripePaymentIntentId,
          stripeSubscriptionId: e.stripeSubscriptionId,
          stripePriceId: e.stripePriceId,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
          name: bundle.name,
          itemType: 'bundle',
          description: bundle.description,
          price: bundle.priceAmount,
        };
      } else if (channel) {
        enriched = {
          id: e.id,
          userId: e.userId,
          contentType: e.contentType,
          contentId: e.contentId,
          entitlementType: e.entitlementType,
          startsAt: e.startsAt,
          expiresAt: e.expiresAt,
          maxSimultaneousStreams: e.maxSimultaneousStreams,
          stripeCustomerId: e.stripeCustomerId,
          stripeCheckoutSessionId: e.stripeCheckoutSessionId,
          stripePaymentIntentId: e.stripePaymentIntentId,
          stripeSubscriptionId: e.stripeSubscriptionId,
          stripePriceId: e.stripePriceId,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
          name: channel.name,
          itemType: 'channel',
          description: channel.description,
          price: channel.monthlyPrice,
        };
      } else {
        enriched = {
          id: e.id,
          userId: e.userId,
          contentType: e.contentType,
          contentId: e.contentId,
          entitlementType: e.entitlementType,
          startsAt: e.startsAt,
          expiresAt: e.expiresAt,
          maxSimultaneousStreams: e.maxSimultaneousStreams,
          stripeCustomerId: e.stripeCustomerId,
          stripeCheckoutSessionId: e.stripeCheckoutSessionId,
          stripePaymentIntentId: e.stripePaymentIntentId,
          stripeSubscriptionId: e.stripeSubscriptionId,
          stripePriceId: e.stripePriceId,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
          name: 'Unknown Item',
          itemType: 'unknown',
          description: null,
          price: null,
        };
      }
      
      enrichedEntitlements.push(enriched);
    }

    return NextResponse.json(enrichedEntitlements);
  } catch (error) {
    console.error('Error fetching user entitlements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entitlements' },
      { status: 500 }
    );
  }
}
