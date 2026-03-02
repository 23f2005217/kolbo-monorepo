import { NextResponse } from 'next/server';
import { couponQueries } from '@kolbo/database';

export async function GET() {
  try {
    const coupons = await couponQueries.findAll();
    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const coupon = await couponQueries.create(body);
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}
