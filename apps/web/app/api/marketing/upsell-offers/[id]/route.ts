import { NextResponse } from 'next/server';
import { upsellOfferQueries } from "@kolbo/database";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const upsell = await upsellOfferQueries.findById(id);
    if (!upsell) {
      return NextResponse.json(
        { error: 'Upsell offer not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(upsell);
  } catch (error) {
    console.error('Error fetching upsell offer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upsell offer' },
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
    const upsell = await upsellOfferQueries.update(id, body);
    return NextResponse.json(upsell);
  } catch (error) {
    console.error('Error updating upsell offer:', error);
    return NextResponse.json(
      { error: 'Failed to update upsell offer' },
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
    await upsellOfferQueries.delete(id);
    return NextResponse.json({ message: 'Upsell offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting upsell offer:', error);
    return NextResponse.json(
      { error: 'Failed to delete upsell offer' },
      { status: 500 }
    );
  }
}
