import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from "@/stripe";
import { getAdvertiserSession, ADS_SESSION_COOKIE_NAME } from "@kolbo/auth";
import prisma from "@kolbo/database";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(ADS_SESSION_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const session = await getAdvertiserSession(token);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const { campaignId, totalBudget, name, successUrl, cancelUrl } = await request.json();
    if (!campaignId || !totalBudget) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    const stripe = getStripe();

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: session.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Ad Campaign: ${name}`,
              description: 'Funding for streaming TV ad campaign',
            },
            unit_amount: Math.round(totalBudget * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        campaignId,
        advertiserId: session.id,
        type: 'ad_campaign_funding',
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Checkout session error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 });
  }
}
