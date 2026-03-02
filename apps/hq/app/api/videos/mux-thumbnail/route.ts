import { NextResponse } from 'next/server';
import { getSignedThumbnailUrl } from '@/mux-thumbnail';

export async function POST(request: Request) {
  try {
    const { playbackId, width, height, fitMode, time } = await request.json();

    if (!playbackId) {
      return NextResponse.json({ error: 'playbackId required' }, { status: 400 });
    }

    const url = await getSignedThumbnailUrl(playbackId, { width, height, fitMode, time });
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating thumbnail URL:', error);
    return NextResponse.json({ error: 'Failed to generate thumbnail URL' }, { status: 500 });
  }
}
