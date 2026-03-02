import { NextResponse } from 'next/server';
import { filterQueries } from '@kolbo/database';

type Params = Promise<{ id: string }>;

export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  const { id } = await params;
  try {
    const filter = await filterQueries.findById(id);
    if (!filter) {
      return NextResponse.json({ error: 'Filter not found' }, { status: 404 });
    }
    return NextResponse.json(filter);
  } catch (error) {
    console.error('Error fetching filter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Params }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const filter = await filterQueries.update(id, body);
    return NextResponse.json(filter);
  } catch (error) {
    console.error('Error updating filter:', error);
    return NextResponse.json(
      { error: 'Failed to update filter' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  const { id } = await params;
  try {
    await filterQueries.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting filter:', error);
    return NextResponse.json(
      { error: 'Failed to delete filter' },
      { status: 500 }
    );
  }
}
