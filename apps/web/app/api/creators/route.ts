import { NextResponse } from 'next/server';
import { creatorQueries } from "@kolbo/database";

export async function GET() {
  try {
    const creators = await creatorQueries.findAll();
    return NextResponse.json(creators);
  } catch (error) {
    console.error('Error fetching creators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creators' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const creator = await creatorQueries.create({
      displayName: body.displayName,
      bio: body.bio,
      isActive: true,
    });
    return NextResponse.json(creator);
  } catch (error) {
    console.error('Error creating creator:', error);
    return NextResponse.json(
      { error: 'Failed to create creator' },
      { status: 500 }
    );
  }
}
