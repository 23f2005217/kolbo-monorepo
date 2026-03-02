import { NextResponse } from 'next/server';
import { upsellOfferQueries } from '@kolbo/database';

export async function GET() {
  try {
    const upsells = await upsellOfferQueries.findAll();
    return NextResponse.json(upsells);
  } catch (error) {
    console.error('Error fetching upsell offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upsell offers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const upsell = await upsellOfferQueries.create(body);
    return NextResponse.json(upsell, { status: 201 });
  } catch (error) {
    console.error('Error creating upsell offer:', error);
    return NextResponse.json(
      { error: 'Failed to create upsell offer' },
      { status: 500 }
    );
  }
}
