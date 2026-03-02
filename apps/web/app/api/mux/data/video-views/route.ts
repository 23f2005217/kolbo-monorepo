import { NextResponse } from 'next/server';

/**
 * Fetch video views from Mux Data API.
 * Requires MUX_TOKEN_ID and MUX_TOKEN_SECRET (same as Video API).
 * See: https://mux.com/docs/api-reference/data/video-views/list-video-views
 */
export async function GET(request: Request) {
  try {
    const tokenId = process.env.MUX_TOKEN_ID;
    const tokenSecret = process.env.MUX_TOKEN_SECRET;
    if (!tokenId || !tokenSecret) {
      return NextResponse.json(
        { error: 'Mux credentials not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7:days';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 200);

    const url = new URL('https://api.mux.com/data/v1/video-views');
    url.searchParams.set('limit', String(limit));
    url.searchParams.append('timeframe[]', timeframe);

    const res = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${tokenId}:${tokenSecret}`).toString('base64')}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Mux Data API error:', res.status, errText);
      return NextResponse.json(
        { error: 'Failed to fetch Mux Data', details: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Mux video views:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video views' },
      { status: 500 }
    );
  }
}
