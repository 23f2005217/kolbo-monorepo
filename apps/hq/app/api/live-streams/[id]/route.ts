import { NextResponse } from 'next/server';
import { liveStreamQueries } from '@kolbo/database';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stream = await liveStreamQueries.findById(id);
    if (!stream) {
      return NextResponse.json(
        { error: 'Live stream not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(stream);
  } catch (error) {
    console.error('Error fetching live stream:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live stream' },
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
    const stream = await liveStreamQueries.update(id, body);
    return NextResponse.json(stream);
  } catch (error) {
    console.error('Error updating live stream:', error);
    return NextResponse.json(
      { error: 'Failed to update live stream' },
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
    await liveStreamQueries.delete(id);
    return NextResponse.json({ message: 'Live stream deleted successfully' });
  } catch (error) {
    console.error('Error deleting live stream:', error);
    return NextResponse.json(
      { error: 'Failed to delete live stream' },
      { status: 500 }
    );
  }
}
