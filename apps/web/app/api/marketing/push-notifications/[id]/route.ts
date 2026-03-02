import { NextResponse } from 'next/server';
import { pushNotificationQueries } from "@kolbo/database";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const notification = await pushNotificationQueries.findById(id);
    if (!notification) {
      return NextResponse.json(
        { error: 'Push notification not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error fetching push notification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch push notification' },
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
    const notification = await pushNotificationQueries.update(id, body);
    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error updating push notification:', error);
    return NextResponse.json(
      { error: 'Failed to update push notification' },
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
    await pushNotificationQueries.delete(id);
    return NextResponse.json({ message: 'Push notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting push notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete push notification' },
      { status: 500 }
    );
  }
}
