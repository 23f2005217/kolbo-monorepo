import { NextResponse } from 'next/server';
import { subscriptionPlanQueries } from "@kolbo/database";
import { updateStripeProduct, createStripeProduct, deactivateStripeProduct } from "@/stripe";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plan = await subscriptionPlanQueries.findById(id);
    if (!plan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plan' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, interval, isActive } = body;

    // Get existing plan to check for Stripe IDs
    const existingPlan = await subscriptionPlanQueries.findById(id);
    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (interval !== undefined) updateData.priceInterval = interval;

    // Handle price update
    if (price !== undefined) {
      updateData.priceAmount = Math.round(parseFloat(price) * 100);
    }

    // Sync with Stripe
    let stripeProductId = existingPlan.stripeProductId;
    let stripePriceId = existingPlan.stripePriceId;

    try {
      if (stripeProductId) {
        // Update existing Stripe product
        const stripeResult = await updateStripeProduct({
          stripeProductId,
          stripePriceId: stripePriceId || undefined,
          name: name !== undefined ? name : undefined,
          description: description !== undefined ? description : undefined,
          price: price !== undefined ? parseFloat(price) : undefined,
          interval: (interval || existingPlan.priceInterval || 'month') as 'month' | 'year' | 'week' | 'day',
        });
        stripePriceId = stripeResult.priceId;
        updateData.stripePriceId = stripePriceId;
      } else if (price !== undefined && name) {
        // Create new Stripe product if we have price and name but no existing product
        const stripeResult = await createStripeProduct({
          name: name || existingPlan.name,
          description: description !== undefined ? description : existingPlan.description || undefined,
          price: parseFloat(price),
          interval: (interval || 'month') as 'month' | 'year' | 'week' | 'day',
        });
        updateData.stripeProductId = stripeResult.productId;
        updateData.stripePriceId = stripeResult.priceId;
      }
    } catch (stripeError) {
      console.error('Stripe error:', stripeError);
      // Continue without Stripe if it fails
    }

    const plan = await subscriptionPlanQueries.update(id, updateData);
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get existing plan to check for Stripe ID
    const existingPlan = await subscriptionPlanQueries.findById(id);

    // Deactivate in Stripe if product exists
    if (existingPlan?.stripeProductId) {
      try {
        await deactivateStripeProduct(existingPlan.stripeProductId);
      } catch (stripeError) {
        console.error('Stripe deactivation error:', stripeError);
        // Continue with local deletion even if Stripe fails
      }
    }

    await subscriptionPlanQueries.delete(id);
    return NextResponse.json({ message: 'Subscription plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription plan' },
      { status: 500 }
    );
  }
}