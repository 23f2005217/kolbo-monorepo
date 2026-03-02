import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      playbackPolicy = 'public',
      newAssetSettings,
      reconnectWindow = 60,
      latencyMode = 'standard'
    } = body;

    const liveStream = await mux.video.liveStreams.create({
      playback_policy: [playbackPolicy],
      new_asset_settings: newAssetSettings || { playback_policy: [playbackPolicy] },
      reconnect_window: reconnectWindow,
      latency_mode: latencyMode,
    });

    return NextResponse.json({
      id: liveStream.id,
      streamKey: liveStream.stream_key,
      playbackId: liveStream.playback_ids?.[0]?.id,
      status: liveStream.status,
      rtmpUrl: `rtmps://global-live.mux.com:443/app`,
      srtUrl: `srt://global-live.mux.com:6001?streamid=${liveStream.stream_key}&passphrase=${liveStream.srt_passphrase}`,
      srtPassphrase: liveStream.srt_passphrase,
      reconnectWindow: liveStream.reconnect_window,
      latencyMode: liveStream.latency_mode,
    });
  } catch (error) {
    console.error('Error creating Mux live stream:', error);
    return NextResponse.json(
      { error: 'Failed to create live stream' },
      { status: 500 }
    );
  }
}
