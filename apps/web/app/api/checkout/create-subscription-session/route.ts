import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from "@/stripe";
import prisma from "@kolbo/database";
import Stripe from 'stripe';

interface ChannelConfigInput {
  subsiteId?: string;
  devices: number;
  hasAds: boolean;
  calculatedPriceCents: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, selectedStreams, selectedExperience, selectedChannels, selectedBundles, successUrl, cancelUrl } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const stripe = getStripe();

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

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const metadata: Record<string, string> = { userId };

    if (selectedStreams?.id) {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: selectedStreams.id },
      });
      if (plan) {
        let priceValue = plan.priceAmount || 0;
        const base = plan.maxDevices || 3;
        if (selectedStreams.devices > base) {
          priceValue += (selectedStreams.devices - base) * (plan.extraDevicePrice || 0);
        }

        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan.name} (${selectedStreams.devices} Devices)`,
              metadata: { planId: plan.id },
            },
            unit_amount: priceValue,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        });
        metadata.selectedStreams = JSON.stringify(selectedStreams);
      }
    }

    if (selectedExperience?.id) {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: selectedExperience.id },
      });
      if (plan) {
         lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan.name} (${selectedExperience.hasAds ? 'With Ads' : 'No Ads'})`,
              metadata: { planId: plan.id },
            },
            unit_amount: plan.priceAmount || 0,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        });
        metadata.selectedExperience = JSON.stringify(selectedExperience);
      }
    }

    if (selectedBundles?.length > 0) {
      const validBundleIds = selectedBundles.map((b: any) => b.id).filter(Boolean);
      const bundles = await prisma.bundle.findMany({
        where: { id: { in: validBundleIds } },
      });
      for (const bConfig of selectedBundles) {
        const bundle = bundles.find(b => b.id === bConfig.id);
        if (bundle) {
          let priceValue = bundle.priceAmount || 0;
          const base = bundle.baseDevices || 3;
          if (bConfig.devices > base) {
            priceValue += (bConfig.devices - base) * (bundle.extraDevicePrice || 0);
          }

          lineItems.push({
             price_data: {
              currency: 'usd',
              product_data: {
                name: `${bundle.name} (${bConfig.devices} Devices)`,
                metadata: { bundleId: bundle.id },
              },
              unit_amount: priceValue,
              recurring: { interval: 'month' },
            },
            quantity: 1,
          });
        }
      }
      metadata.selectedBundles = JSON.stringify(selectedBundles);
    }

    if (selectedChannels?.length > 0) {
      for (const chConfig of selectedChannels as ChannelConfigInput[]) {
        if (!chConfig?.subsiteId) {
          console.warn('[Checkout] Skipping channel config missing subsiteId:', chConfig);
          continue;
        }
        const channel = await prisma.subsite.findUnique({ where: { id: chConfig.subsiteId } });
        if (!channel) continue;

        const tierLabel = `${chConfig.devices} Devices${chConfig.hasAds ? ', With Ads' : ', No Ads'}`;
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${channel.name} - ${tierLabel}`,
              metadata: { subsiteId: channel.id },
            },
            unit_amount: chConfig.calculatedPriceCents,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        });
      }

      metadata.kolbo_config = JSON.stringify(
        (selectedChannels as ChannelConfigInput[])
          .filter(c => c.subsiteId)
          .map(c => ({
            subsiteId: c.subsiteId,
            devices: c.devices,
            hasAds: c.hasAds,
          }))
      );
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: 'No valid subscription items found' }, { status: 400 });
    }

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
    console.error('[Checkout] Error creating subscription session:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription session', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
