import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from "@/stripe";
import prisma from "@kolbo/database";
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, planIds, channelIds, bundleIds, successUrl, cancelUrl } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const stripe = getStripe();

    // 1. Resolve Stripe Customer
    let stripeCustomerId: string | undefined;
    const existingCustomer = await prisma.stripeCustomer.findUnique({
      where: { userId },
    });

    if (existingCustomer) {
      stripeCustomerId = existingCustomer.stripeCustomerId;
    } else {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const customer = await stripe.customers.create({
        email: user?.email,
        metadata: { userId },
      });
      await prisma.stripeCustomer.create({
        data: {
          userId,
          stripeCustomerId: customer.id,
        },
      });
      stripeCustomerId = customer.id;
    }

    // 2. Collect Line Items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const metadata: Record<string, string> = { userId };

    // Fetch Plans
    if (planIds?.length > 0) {
      const plans = await prisma.subscriptionPlan.findMany({
        where: { id: { in: planIds } },
      });
      for (const plan of plans) {
        if (plan.stripePriceId) {
          lineItems.push({ price: plan.stripePriceId, quantity: 1 });
        }
      }
      metadata.planIds = planIds.join(',');
    }

    // Fetch Bundles
    if (bundleIds?.length > 0) {
      const bundles = await prisma.bundle.findMany({
        where: { id: { in: bundleIds } },
      });
      for (const bundle of bundles) {
        if (bundle.stripePriceId) {
          lineItems.push({ price: bundle.stripePriceId, quantity: 1 });
        }
      }
      metadata.bundleIds = bundleIds.join(',');
    }

    // Fetch Individual Channels
    if (channelIds?.length > 0) {
      const channels = await prisma.subsite.findMany({
        where: { id: { in: channelIds } },
      });
      for (const channel of channels) {
        if (channel.stripePriceId) {
          lineItems.push({ price: channel.stripePriceId, quantity: 1 });
        }
      }
      metadata.channelIds = channelIds.join(',');
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'No valid subscription items found' }, { status: 400 });
    }

    // 3. Create Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: lineItems,
      metadata,
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: metadata,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating subscription session:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription session', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
