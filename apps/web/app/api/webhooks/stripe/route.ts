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
    const webhookSecretV = process.env.STRIPE_WEBHOOK_SECRET_V;

    if (!webhookSecret) {
      event = JSON.parse(body) as Stripe.Event;
    } else {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        if (webhookSecretV) {
          console.warn('First webhook secret failed, trying secondary secret...');
          event = stripe.webhooks.constructEvent(body, signature, webhookSecretV);
        } else {
          throw err;
        }
      }
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
      case 'invoice_payment.paid':
      case 'invoice.payment_succeeded':
      case 'invoice.paid': {
        const invoice = event.data.object as any;
        if (invoice.subscription && typeof invoice.subscription === 'string') {
          await handleInvoicePaid(invoice);
        } else if (event.type === 'invoice_payment.paid') {
          console.log('[Webhook] Received custom invoice_payment.paid event:', invoice.id);
        }
        break;
      }
      case 'checkout.session.expired': {
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
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

async function handleInvoicePaid(invoice: any) {
  const stripe = getStripe();
  const subscriptionId = invoice.subscription;
  if (!subscriptionId || typeof subscriptionId !== 'string') return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const metadata = subscription.metadata || {};

  if (metadata.kolbo_config) {
    let targetUserId = metadata.userId;

    // Fallback: discover user from customer if userId is missing in metadata
    if (!targetUserId && typeof subscription.customer === 'string') {
      const customerRecord = await prisma.stripeCustomer.findFirst({
        where: { stripeCustomerId: subscription.customer }
      });
      if (customerRecord) targetUserId = customerRecord.userId;
    }

    if (targetUserId) {
      await provisionUserSubscriptions(targetUserId, metadata.kolbo_config, subscription.id);
      console.log(`[Webhook] Fallback provisioned for user ${targetUserId} via invoice ${invoice.id}`);
    }
  }
}

async function provisionUserSubscriptions(targetUserId: string, kolbo_config: string, subscriptionId: string | null) {
  try {
    const configs = JSON.parse(kolbo_config) as Array<{
      subsiteId: string;
      devices: number;
      hasAds: boolean;
    }>;

    let profile = await prisma.profile.findFirst({
      where: { userId: targetUserId },
    });
    if (!profile) {
      profile = await prisma.profile.create({
        data: { userId: targetUserId, isPrimary: true, maxDevices: 5 },
      });
    }

    for (const cfg of configs) {
      const existing = await prisma.userSubscription.findFirst({
        where: {
          userId: targetUserId,
          subsiteId: cfg.subsiteId,
          status: 'active',
        },
      });

      if (existing) {
        await prisma.userSubscription.update({
          where: { id: existing.id },
          data: {
            maxDevices: cfg.devices,
            hasAds: cfg.hasAds,
            stripeSubscriptionId: subscriptionId || existing.stripeSubscriptionId,
            startsAt: new Date(),
          },
        });
      } else {
        await prisma.userSubscription.create({
          data: {
            userId: targetUserId,
            profileId: profile.id,
            subsiteId: cfg.subsiteId,
            stripeSubscriptionId: subscriptionId,
            status: 'active',
            maxDevices: cfg.devices,
            hasAds: cfg.hasAds,
          },
        });
      }
    }
    console.log(`[Webhook] Provisioned ${configs.length} UserSubscription(s) for user ${targetUserId}`);
  } catch (err) {
    console.error('[Webhook] Error provisioning UserSubscriptions:', err);
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};
  const { videoId, offerId, offerType, rentalDurationDays, userId, maxSimultaneousStreams, planIds, bundleIds, channelIds, selectedStreams, selectedExperience, selectedBundles } = metadata;

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

  if (planIds) {
    const ids = planIds.split(',');
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

  if (metadata.kolbo_config) {
    await provisionUserSubscriptions(
      targetUserId,
      metadata.kolbo_config,
      typeof session.subscription === 'string' ? session.subscription : null
    );
  }

  if (selectedStreams) {
    await provisionStreams(targetUserId, selectedStreams, typeof session.subscription === 'string' ? session.subscription : null);
  }
  if (selectedExperience) {
    await provisionExperience(targetUserId, selectedExperience, typeof session.subscription === 'string' ? session.subscription : null);
  }
  if (selectedBundles) {
    await provisionBundles(targetUserId, selectedBundles, typeof session.subscription === 'string' ? session.subscription : null);
  }

  if (metadata.type === 'ad_campaign_funding' && metadata.campaignId) {
    // Handle Ad Campaign funding
    await prisma.adCampaign.update({
      where: { id: metadata.campaignId },
      data: { status: 'active' },
    });
    
    await prisma.transaction.create({
      data: {
        userId: metadata.advertiserId,
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        status: 'completed',
        productType: 'ad_campaign',
        productName: `Ad Campaign Funding: ${metadata.campaignId}`,
        stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      },
    });

    return;
  }

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

async function provisionStreams(targetUserId: string, selectedStreams: string, subscriptionId: string | null) {
  try {
    const config = JSON.parse(selectedStreams) as { id: string; devices: number };
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: config.id } });
    if (!plan) return;

    // For global plans (streams), we store the SubscriptionPlan.id in subsiteSubscriptionPlanId
    // This is a workaround since these plans apply to all subsites, not a specific one
    const existing = await prisma.userSubscription.findFirst({
      where: {
        userId: targetUserId,
        subsiteSubscriptionPlanId: config.id,
      },
    });

    if (existing) {
      await prisma.userSubscription.update({
        where: { id: existing.id },
        data: {
          status: 'active',
          maxDevices: config.devices,
          stripeSubscriptionId: subscriptionId,
          startsAt: new Date(),
        },
      });
    } else {
      await prisma.userSubscription.create({
        data: {
          userId: targetUserId,
          subsiteSubscriptionPlanId: config.id, // Stores SubscriptionPlan.id for global plans
          status: 'active',
          maxDevices: config.devices,
          stripeSubscriptionId: subscriptionId,
          startsAt: new Date(),
        },
      });
    }
  } catch (err) {
    console.error('[Webhook] Error provisioning streams:', err);
  }
}

async function provisionExperience(targetUserId: string, selectedExperience: string, subscriptionId: string | null) {
  try {
    const config = JSON.parse(selectedExperience) as { id: string; hasAds: boolean };
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: config.id } });
    if (!plan) return;

    // For global plans (experience), we store the SubscriptionPlan.id in subsiteSubscriptionPlanId
    // This is a workaround since these plans apply to all subsites, not a specific one
    const existing = await prisma.userSubscription.findFirst({
      where: {
        userId: targetUserId,
        subsiteSubscriptionPlanId: config.id,
      },
    });

    if (existing) {
      await prisma.userSubscription.update({
        where: { id: existing.id },
        data: {
          status: 'active',
          hasAds: config.hasAds,
          stripeSubscriptionId: subscriptionId,
          startsAt: new Date(),
        },
      });
    } else {
      await prisma.userSubscription.create({
        data: {
          userId: targetUserId,
          subsiteSubscriptionPlanId: config.id, // Stores SubscriptionPlan.id for global plans
          status: 'active',
          hasAds: config.hasAds,
          stripeSubscriptionId: subscriptionId,
          startsAt: new Date(),
        },
      });
    }
  } catch (err) {
    console.error('[Webhook] Error provisioning experience:', err);
  }
}

async function provisionBundles(targetUserId: string, selectedBundles: string, subscriptionId: string | null) {
  try {
    const configs = JSON.parse(selectedBundles) as Array<{ id: string; devices: number }>;
    for (const cfg of configs) {
      // Find existing subscription by userId + bundleId
      const existing = await prisma.userSubscription.findFirst({
        where: {
          userId: targetUserId,
          bundleId: cfg.id,
        },
      });

      if (existing) {
        await prisma.userSubscription.update({
          where: { id: existing.id },
          data: {
            status: 'active',
            maxDevices: cfg.devices,
            stripeSubscriptionId: subscriptionId,
            startsAt: new Date(),
          },
        });
      } else {
        await prisma.userSubscription.create({
          data: {
            userId: targetUserId,
            bundleId: cfg.id,
            status: 'active',
            maxDevices: cfg.devices,
            stripeSubscriptionId: subscriptionId,
            startsAt: new Date(),
          },
        });
      }
    }
  } catch (err) {
    console.error('[Webhook] Error provisioning bundles:', err);
  }
}
