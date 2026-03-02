import { NextResponse } from 'next/server';
import { pushNotificationQueries } from '@kolbo/database';

export async function GET() {
  try {
    const notifications = await pushNotificationQueries.findAll();
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching push notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch push notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const notification = await pushNotificationQueries.create(body);
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating push notification:', error);
    return NextResponse.json(
      { error: 'Failed to create push notification' },
      { status: 500 }
    );
  }
}
