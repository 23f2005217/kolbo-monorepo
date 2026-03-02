import { NextResponse } from 'next/server';
import { liveStreamQueries } from "@kolbo/database";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    let muxData = null;
    if (body.sourceType === 'mux_rtmp' || body.sourceType === 'browser') {
      const muxResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/mux/create-live-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playbackPolicy: body.isFree ? 'public' : 'signed',
          latencyMode: 'low',
        }),
      });

      if (muxResponse.ok) {
        muxData = await muxResponse.json();
      }
    }

    const streamData = {
      ...body,
      muxLiveStreamId: muxData?.id,
      muxStreamKey: muxData?.streamKey,
      muxPlaybackId: muxData?.playbackId,
      muxRtmpUrl: muxData?.rtmpUrl,
    };

    const stream = await liveStreamQueries.create(streamData);
    
    return NextResponse.json({
      ...stream,
      srtUrl: muxData?.srtUrl,
      srtPassphrase: muxData?.srtPassphrase,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating live stream:', error);
    return NextResponse.json(
      { error: 'Failed to create live stream' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const options = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined,
    };

    const streams = await liveStreamQueries.findAll(options);
    return NextResponse.json(streams);
  } catch (error) {
    console.error('Error fetching live streams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live streams' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const ids = body.ids;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs are required for bulk deletion' },
        { status: 400 }
      );
    }

    await liveStreamQueries.deleteMany(ids);
    return NextResponse.json({ message: 'Live streams deleted successfully' });
  } catch (error) {
    console.error('Error deleting live streams:', error);
    return NextResponse.json(
      { error: 'Failed to delete live streams' },
      { status: 500 }
    );
  }
}
