import { NextResponse } from 'next/server';
import { calendarEventQueries } from '@kolbo/database';

export async function GET() {
  try {
    const events = await calendarEventQueries.findAll();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (Array.isArray(body)) {
      const results = await Promise.all(body.map((event: any) => calendarEventQueries.create(event)));
      return NextResponse.json(results, { status: 201 });
    }

    const event = await calendarEventQueries.create(body);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}
