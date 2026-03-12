import { NextRequest, NextResponse } from 'next/server';
import prisma from "@kolbo/database";

interface EnrichedEntitlement {
    id: string;
    contentType: string;
    contentId: string;
    entitlementType: string;
    startsAt: Date;
    expiresAt: Date | null;
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
                    price: true,
                    originalPrice: true,
                    discountPercent: true,
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
        const enrichedEntitlements: EnrichedEntitlement[] = entitlements.map(e => {
            const plan = planMap.get(e.contentId);
            const bundle = bundleMap.get(e.contentId);
            const channel = channelMap.get(e.contentId);

            if (plan) {
                return {
                    ...e,
                    name: plan.name,
                    itemType: 'plan',
                    description: plan.description,
                    price: plan.priceAmount,
                };
            } else if (bundle) {
                return {
                    ...e,
                    name: bundle.name,
                    itemType: 'bundle',
                    description: bundle.description,
                    price: bundle.price,
                };
            } else if (channel) {
                return {
                    ...e,
                    name: channel.name,
                    itemType: 'channel',
                    description: channel.description,
                    price: channel.monthlyPrice,
                };
            } else {
                return {
                    ...e,
                    name: 'Unknown Item',
                    itemType: 'unknown',
                    description: null,
                    price: null,
                };
            }
        });

        return NextResponse.json(enrichedEntitlements);
    } catch (error) {
        console.error('Error fetching user entitlements:', error);
        return NextResponse.json(
            { error: 'Failed to fetch entitlements' },
            { status: 500 }
        );
    }
}
