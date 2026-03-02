import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from "@/stripe";
import prisma from "@kolbo/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, offerId, userId, successUrl, cancelUrl, maxSimultaneousStreams, calculatedPriceCents } = body;

    if (!videoId || !offerId) {
      return NextResponse.json(
        { error: 'Video ID and Offer ID are required' },
        { status: 400 }
      );
    }

    // Get the video and offer details
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        offers: {
          where: { id: offerId, isActive: true },
        },
      },
    });

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const offer = video.offers[0];
    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found or inactive' },
        { status: 404 }
      );
    }

    const stripe = getStripe();

    // Get or create Stripe customer if user is logged in
    let stripeCustomerId: string | undefined;
    if (userId) {
      const existingCustomer = await prisma.stripeCustomer.findUnique({
        where: { userId },
      });

      if (existingCustomer) {
        stripeCustomerId = existingCustomer.stripeCustomerId;
      } else {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
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
    }

    // Determine if this is a rental or purchase
    const isRental = offer.offerType === 'rental';
    const tierSuffix = (offer as any).tierLabel ? ` (${(offer as any).tierLabel})` : '';
    const deviceSuffix = maxSimultaneousStreams > 1 ? ` (${maxSimultaneousStreams} devices)` : '';
    const productName = isRental
      ? `${video.title} - ${offer.rentalDurationDays} Day Rental${tierSuffix}${deviceSuffix}`
      : `${video.title} - Purchase${tierSuffix}${deviceSuffix}`;

    // Use calculated price if provided, otherwise use offer amount
    const finalAmountCents = calculatedPriceCents || offer.amountCents;

    // Build success URL with session ID placeholder
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const finalSuccessUrl = successUrl || `${baseUrl}/watch/${videoId}/play?checkout_session={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/watch/${videoId}`;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: offer.currency,
            product_data: {
              name: productName,
              description: isRental
                ? `Access for ${offer.rentalDurationDays} days${tierSuffix}`
                : `Lifetime access${tierSuffix}`,
              metadata: {
                videoId,
                offerId,
                offerType: offer.offerType,
              },
            },
            unit_amount: finalAmountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        videoId,
        offerId,
        offerType: offer.offerType,
        rentalDurationDays: offer.rentalDurationDays?.toString() || '',
        userId: userId || '',
        maxSimultaneousStreams: maxSimultaneousStreams?.toString() || '',
      },
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

