import { NextRequest, NextResponse } from 'next/server';
import { adInventoryQueries } from "@kolbo/database";

export async function GET(request: NextRequest) {
  try {
    const channels = await adInventoryQueries.getAvailableChannels();

    return NextResponse.json({ channels });
  } catch (err) {
    console.error('Get inventory error:', err);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}
