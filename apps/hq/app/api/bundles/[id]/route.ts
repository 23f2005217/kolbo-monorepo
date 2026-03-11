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
    const { name, description, price, isActive, subsiteIds, position } = body;

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
      updateData.price = price !== null
        ? Math.round(parseFloat(price) * 100)
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
