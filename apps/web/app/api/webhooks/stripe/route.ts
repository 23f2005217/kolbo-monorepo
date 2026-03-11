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
  const { videoId, offerId, offerType, rentalDurationDays, userId, maxSimultaneousStreams, planIds, bundleIds, channelIds } = metadata;

  // Resolve User ID
  let targetUserId = userId;
  if (!targetUserId && typeof session.customer === 'string') {
    const customerRecord = await prisma.stripeCustomer.findFirst({
      where: { stripeCustomerId: session.customer }
    });
    if (customerRecord) targetUserId = customerRecord.userId;
  }
  if (!targetUserId && session.customer_details?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.customer_details.email }
    });
    if (user) targetUserId = user.id;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!targetUserId || !uuidRegex.test(targetUserId)) {
    console.error(`CRITICAL: Cannot Create Entitlement. No valid UUID found for session ${session.id}`);
    return;
  }

  // --- 1. Handle Video Purchases/Rentals (Existing Logic) ---
  if (videoId) {
    let expiresAt: Date | null = null;
    if (offerType === 'rental' && rentalDurationDays) {
      const days = parseInt(rentalDurationDays, 10);
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
    }
    const entitlementType = offerType === 'rental' ? 'rental' : 'purchase';
    const maxStreamsValue = maxSimultaneousStreams ? parseInt(maxSimultaneousStreams, 10) : 1;

    await prisma.entitlement.upsert({
      where: {
        userId_contentType_contentId_entitlementType: {
          userId: targetUserId,
          contentType: 'video',
          contentId: videoId,
          entitlementType: entitlementType as 'rental' | 'purchase',
        },
      },
      update: {
        startsAt: new Date(),
        expiresAt,
        maxSimultaneousStreams: isNaN(maxStreamsValue) ? 1 : maxStreamsValue,
        stripeCheckoutSessionId: session.id,
      },
      create: {
        userId: targetUserId,
        contentType: 'video',
        contentId: videoId,
        entitlementType: entitlementType as 'rental' | 'purchase',
        startsAt: new Date(),
        expiresAt,
        maxSimultaneousStreams: isNaN(maxStreamsValue) ? 1 : maxStreamsValue,
        stripeCustomerId: session.customer as string | null,
        stripeCheckoutSessionId: session.id,
      },
    });
  }

  // --- 2. Handle Subscription Plans ---
  if (planIds) {
    const ids = planIds.split(',');
    for (const id of ids) {
       await prisma.entitlement.upsert({
         where: {
           userId_contentType_contentId_entitlementType: {
             userId: targetUserId,
             contentType: 'video', // Plans cover all videos generally, or we use a special ID
             contentId: id,
             entitlementType: 'subscription',
           }
         },
         update: { startsAt: new Date(), stripeCheckoutSessionId: session.id },
         create: {
           userId: targetUserId,
           contentType: 'video',
           contentId: id,
           entitlementType: 'subscription',
           startsAt: new Date(),
           stripeCustomerId: session.customer as string | null,
           stripeCheckoutSessionId: session.id,
         }
       });
    }
  }

  // --- 3. Handle Bundles ---
  if (bundleIds) {
    const ids = bundleIds.split(',');
    for (const id of ids) {
       await prisma.entitlement.upsert({
         where: {
           userId_contentType_contentId_entitlementType: {
             userId: targetUserId,
             contentType: 'video',
             contentId: id,
             entitlementType: 'subscription',
           }
         },
         update: { startsAt: new Date(), stripeCheckoutSessionId: session.id },
         create: {
           userId: targetUserId,
           contentType: 'video',
           contentId: id,
           entitlementType: 'subscription',
           startsAt: new Date(),
           stripeCustomerId: session.customer as string | null,
           stripeCheckoutSessionId: session.id,
         }
       });
    }
  }

  // --- 4. Handle Individual Channels ---
  if (channelIds) {
    const ids = channelIds.split(',');
    for (const id of ids) {
       await prisma.entitlement.upsert({
         where: {
           userId_contentType_contentId_entitlementType: {
             userId: targetUserId,
             contentType: 'video',
             contentId: id,
             entitlementType: 'subscription',
           }
         },
         update: { startsAt: new Date(), stripeCheckoutSessionId: session.id },
         create: {
           userId: targetUserId,
           contentType: 'video',
           contentId: id,
           entitlementType: 'subscription',
           startsAt: new Date(),
           stripeCustomerId: session.customer as string | null,
           stripeCheckoutSessionId: session.id,
         }
       });
    }
  }

  // Create Transaction Record
  await prisma.transaction.create({
    data: {
      userId: targetUserId,
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      status: 'completed',
      productType: videoId ? 'video_purchase' : 'subscription',
      productName: `Order ${session.id}`,
      stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    },
  });
}

