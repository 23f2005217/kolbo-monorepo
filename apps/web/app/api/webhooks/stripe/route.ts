import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from "@/stripe";
import prisma from "@kolbo/database";
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('Webhook Error: Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      event = JSON.parse(body) as Stripe.Event;
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'checkout.session.expired': {
        break;
      }
      default:
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};

  const { videoId, offerId, offerType, rentalDurationDays, userId, maxSimultaneousStreams } = metadata;

  if (!videoId) {
    console.error('CRITICAL: Missing videoId in checkout session metadata');
    return;
  }

  // Calculate expiration date for rentals
  let expiresAt: Date | null = null;
  if (offerType === 'rental' && rentalDurationDays) {
    const days = parseInt(rentalDurationDays, 10);
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
  }

  // Determine entitlement type
  const entitlementType = offerType === 'rental' ? 'rental' : 'purchase';
  
  // Resolve User ID
  let targetUserId = userId;

  // 1. If no metadata userId, check Stripe Customer link
  if (!targetUserId && typeof session.customer === 'string') {
      const customerRecord = await prisma.stripeCustomer.findFirst({
          where: { stripeCustomerId: session.customer }
      });
      if (customerRecord) {
          targetUserId = customerRecord.userId;
      }
  }

  // 2. If still no userId, try to find by email from session
  if (!targetUserId && session.customer_details?.email) {
      const user = await prisma.user.findUnique({
          where: { email: session.customer_details.email }
      });
      if (user) {
          targetUserId = user.id;
      }
  }

  // 3. Validation: If we still don't have a valid UUID, we cannot insert into DB
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!targetUserId || !uuidRegex.test(targetUserId)) {
      console.error(`CRITICAL: Cannot Create Entitlement. No valid UUID User ID found for session ${session.id}. Resolved: ${targetUserId}`);
      return; 
  }

  // Parse max simultaneous streams from metadata (default to 1)
  const maxStreamsValue = maxSimultaneousStreams ? parseInt(maxSimultaneousStreams, 10) : 1;

  // Create or update entitlement
  const entitlementData = {
    userId: targetUserId,
    contentType: 'video' as const,
    contentId: videoId,
    entitlementType: entitlementType as 'rental' | 'purchase',
    startsAt: new Date(),
    expiresAt,
    maxSimultaneousStreams: isNaN(maxStreamsValue) ? 1 : maxStreamsValue,
    stripeCustomerId: session.customer as string | null,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: session.payment_intent as string | null,
  };

  try {
    // Upsert the entitlement (update if exists, create if not)
    const savedEntitlement = await prisma.entitlement.upsert({
      where: {
        userId_contentType_contentId_entitlementType: {
          userId: entitlementData.userId,
          contentType: 'video',
          contentId: videoId,
          entitlementType: entitlementData.entitlementType,
        },
      },
      update: {
        startsAt: entitlementData.startsAt,
        expiresAt: entitlementData.expiresAt,
        maxSimultaneousStreams: entitlementData.maxSimultaneousStreams,
        stripeCheckoutSessionId: entitlementData.stripeCheckoutSessionId,
        stripePaymentIntentId: entitlementData.stripePaymentIntentId,
      },
      create: entitlementData,
    });
  } catch (dbError) {
      console.error('DB Error saving entitlement:', dbError);
      throw dbError; // Rethrow to ensure 500 response
  }

  try {
    // Create a transaction record
    await prisma.transaction.create({
      data: {
        userId: entitlementData.userId,
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        status: 'completed',
        productType: entitlementType,
        productName: `Video ${entitlementType}: ${videoId}`,
        stripePaymentIntentId: session.payment_intent as string | null,
      },
    });
  } catch (txError) {
      console.error('DB Error saving transaction:', txError);
      // Don't throw here, entitlement is more important
  }

}

