import { NextResponse } from 'next/server';
import { bundleQueries } from '@kolbo/database';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bundle = await bundleQueries.findById(id);
    if (!bundle) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(bundle);
  } catch (error) {
    console.error('[Bundles] Error fetching bundle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bundle' },
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
      isActive, 
      subsiteIds, 
      position 
    } = body;

    const existingBundle = await bundleQueries.findById(id);
    if (!existingBundle) {
      return NextResponse.json(
        { error: 'Bundle not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (position !== undefined) updateData.position = position;
    if (subsiteIds !== undefined) updateData.subsiteIds = subsiteIds;

    if (price !== undefined) {
      updateData.priceAmount = price !== null
        ? Math.round(parseFloat(price) * 100)
        : null;
    }

    if (originalPrice !== undefined) {
      updateData.originalPrice = originalPrice !== null
        ? Math.round(parseFloat(String(originalPrice)) * 100)
        : null;
    }

    if (baseDevices !== undefined) {
      updateData.baseDevices = baseDevices !== null
        ? parseInt(String(baseDevices))
        : 3;
    }

    if (extraDevicePrice !== undefined) {
      updateData.extraDevicePrice = extraDevicePrice !== null
        ? Math.round(parseFloat(String(extraDevicePrice)) * 100)
        : 0;
    }

    if (maxTotalDevices !== undefined) {
      updateData.maxTotalDevices = maxTotalDevices !== null
        ? parseInt(String(maxTotalDevices))
        : 10;
    }

    if (withAdsDiscount !== undefined) {
      updateData.withAdsDiscount = withAdsDiscount !== null
        ? Math.round(parseFloat(String(withAdsDiscount)) * 100)
        : 0;
    }

    if (discountPercent !== undefined) {
      updateData.discountPercent = discountPercent !== null
        ? parseInt(String(discountPercent))
        : null;
    }

    const bundle = await bundleQueries.update(id, updateData as any);
    return NextResponse.json(bundle);
  } catch (error) {
    console.error('[Bundles] Error updating bundle:', error);
    return NextResponse.json(
      { error: 'Failed to update bundle' },
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
    await bundleQueries.delete(id);
    return NextResponse.json({ message: 'Bundle deleted successfully' });
  } catch (error) {
    console.error('[Bundles] Error deleting bundle:', error);
    return NextResponse.json(
      { error: 'Failed to delete bundle' },
      { status: 500 }
    );
  }
}
