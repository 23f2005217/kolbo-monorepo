import { NextResponse } from 'next/server';
import { bundleQueries } from '@kolbo/database';

export async function GET() {
  try {
    const bundles = await bundleQueries.findAll();
    return NextResponse.json(bundles);
  } catch (error) {
    console.error('[Bundles] Error fetching bundles:', error);
    return NextResponse.json({ error: 'Failed to fetch bundles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      price, 
      originalPrice, 
      discountPercent, 
      baseDevices,
      extraDevicePrice,
      maxTotalDevices,
      withAdsDiscount,
      subsiteIds, 
      isActive = true, 
      position 
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Bundle name is required' },
        { status: 400 }
      );
    }

    const priceInCents = price !== undefined && price !== null
      ? Math.round(parseFloat(price) * 100)
      : null;

    const originalPriceInCents = originalPrice !== undefined && originalPrice !== null
      ? Math.round(parseFloat(String(originalPrice)) * 100)
      : null;

    const extraDevicePriceInCents = extraDevicePrice !== undefined && extraDevicePrice !== null
      ? Math.round(parseFloat(String(extraDevicePrice)) * 100)
      : 0;

    const withAdsDiscountInCents = withAdsDiscount !== undefined && withAdsDiscount !== null
      ? Math.round(parseFloat(String(withAdsDiscount)) * 100)
      : 0;

    const bundle = await bundleQueries.create({
      name,
      description: description || null,
      priceAmount: priceInCents,
      originalPrice: originalPriceInCents,
      baseDevices: baseDevices ? parseInt(String(baseDevices)) : 3,
      extraDevicePrice: extraDevicePriceInCents,
      maxTotalDevices: maxTotalDevices ? parseInt(String(maxTotalDevices)) : 10,
      withAdsDiscount: withAdsDiscountInCents,
      discountPercent: discountPercent ? parseInt(String(discountPercent)) : null,
      position: position ?? 0,
      isActive,
      subsiteIds: subsiteIds || [],
    });

    return NextResponse.json(bundle, { status: 201 });
  } catch (error) {
    console.error('[Bundles] Error creating bundle:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create bundle', details: errorMessage },
      { status: 500 }
    );
  }
}
