import { NextResponse } from 'next/server';
import { subsiteQueries } from '@kolbo/database';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subsite = await subsiteQueries.findById(id);
    if (!subsite) {
      return NextResponse.json(
        { error: 'Subsite not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(subsite);
  } catch (error) {
    console.error('Error fetching subsite:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subsite' },
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
      name, slug, description, isActive, 
      thumbnailStorageBucket, thumbnailStoragePath, 
      iconStorageBucket, iconStoragePath,
      monthlyPrice, freeTrialDays, category, config,
      fiveDevicesAddonPrice, withAdsDiscount 
    } = body;

    const data: {
      name?: string;
      slug?: string;
      description?: string | null;
      isActive?: boolean;
      thumbnailStorageBucket?: string | null;
      thumbnailStoragePath?: string | null;
      iconStorageBucket?: string | null;
      iconStoragePath?: string | null;
      monthlyPrice?: number | null;
      freeTrialDays?: number | null;
      category?: string | null;
      config?: any;
      fiveDevicesAddonPrice?: number | null;
      withAdsDiscount?: number | null;
    } = {};

    if (name !== undefined) data.name = String(name).trim();
    if (slug !== undefined) data.slug = String(slug).trim().toLowerCase().replace(/\s+/g, '-');
    if (description !== undefined) data.description = description;
    if (typeof isActive === 'boolean') data.isActive = isActive;
    if (thumbnailStorageBucket !== undefined) data.thumbnailStorageBucket = thumbnailStorageBucket;
    if (thumbnailStoragePath !== undefined) data.thumbnailStoragePath = thumbnailStoragePath;
    if (iconStorageBucket !== undefined) data.iconStorageBucket = iconStorageBucket;
    if (iconStoragePath !== undefined) data.iconStoragePath = iconStoragePath;
    if (monthlyPrice !== undefined) data.monthlyPrice = monthlyPrice != null ? parseInt(String(monthlyPrice), 10) || null : null;
    if (freeTrialDays !== undefined) data.freeTrialDays = freeTrialDays != null ? parseInt(String(freeTrialDays), 10) || 0 : 0;
    if (category !== undefined) data.category = category;
    if (config !== undefined) data.config = config;
    if (fiveDevicesAddonPrice !== undefined) data.fiveDevicesAddonPrice = fiveDevicesAddonPrice != null ? parseInt(String(fiveDevicesAddonPrice), 10) || 0 : 0;
    if (withAdsDiscount !== undefined) data.withAdsDiscount = withAdsDiscount != null ? parseInt(String(withAdsDiscount), 10) || 0 : 0;

    const subsite = await subsiteQueries.update(id, data);
    return NextResponse.json(subsite);
  } catch (error) {
    console.error('Error updating subsite:', error);
    return NextResponse.json(
      { error: 'Failed to update subsite' },
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
    await subsiteQueries.delete(id);
    return NextResponse.json({ message: 'Subsite deleted successfully' });
  } catch (error) {
    console.error('Error deleting subsite:', error);
    return NextResponse.json(
      { error: 'Failed to delete subsite' },
      { status: 500 }
    );
  }
}
