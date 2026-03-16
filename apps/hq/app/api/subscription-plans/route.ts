import { NextResponse } from 'next/server';
import { subscriptionPlanQueries } from '@kolbo/database';
import { createStripeProduct } from '@/stripe';

export async function GET() {
  try {
    const plans = await subscriptionPlanQueries.findAllForAdmin();
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      price, 
      interval = 'month', 
      isActive = true, 
      planType, 
      tier, 
      maxDevices, 
      hasAds, 
      extraDevicePrice,
      maxTotalDevices,
      withAdsDiscount,
      position 
    } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }

    const priceAmount = Math.round(parseFloat(price) * 100); // Convert to cents
    
    const extraDevicePriceInCents = extraDevicePrice !== undefined && extraDevicePrice !== null
      ? Math.round(parseFloat(String(extraDevicePrice)) * 100)
      : 0;

    const withAdsDiscountInCents = withAdsDiscount !== undefined && withAdsDiscount !== null
      ? Math.round(parseFloat(String(withAdsDiscount)) * 100)
      : 0;

    // Create product and price in Stripe
    let stripeProductId: string | undefined;
    let stripePriceId: string | undefined;

    try {
      const stripeResult = await createStripeProduct({
        name,
        description,
        price: parseFloat(price),
        interval: interval as 'month' | 'year' | 'week' | 'day',
      });
      stripeProductId = stripeResult.productId;
      stripePriceId = stripeResult.priceId;
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
    }

    // Create the plan in the database
    const plan = await subscriptionPlanQueries.create({
      name,
      description: description || null,
      planType: planType || null,
      tier: tier || null,
      maxDevices: maxDevices ? parseInt(maxDevices) : null,
      hasAds: hasAds || false,
      extraDevicePrice: extraDevicePriceInCents,
      maxTotalDevices: maxTotalDevices ? parseInt(String(maxTotalDevices)) : 10,
      withAdsDiscount: withAdsDiscountInCents,
      stripeProductId,
      stripePriceId,
      priceAmount,
      priceInterval: interval,
      position: position ?? 0,
      isActive,
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create subscription plan', details: errorMessage },
      { status: 500 }
    );
  }
}
