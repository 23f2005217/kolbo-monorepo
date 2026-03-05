import { NextResponse } from 'next/server';
import { filterQueries } from '@kolbo/database';

export async function GET() {
  try {
    const filters = await filterQueries.findAll();
    return NextResponse.json(filters);
  } catch (error) {
    console.error('Error fetching filters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filters' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const filter = await filterQueries.create(body);
    return NextResponse.json(filter, { status: 201 });
  } catch (error) {
    console.error('Error creating filter:', error);
    return NextResponse.json(
      { error: 'Failed to create filter' },
      { status: 500 }
    );
  }
}
