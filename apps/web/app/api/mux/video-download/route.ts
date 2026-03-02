import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { assetId, playbackId, filename } = await request.json();

    if (!assetId || !playbackId) {
      return NextResponse.json(
        { error: 'Asset ID and Playback ID are required' },
        { status: 400 }
      );
    }

    // Try to create a static rendition if it doesn't exist
    try {
      // @ts-ignore - The SDK types might be outdated
      await mux.video.assets.createStaticRendition(assetId, {
        resolution: 'highest',
      });
      
      // Return preparing status - it will take some time to generate
      return NextResponse.json({
        status: 'preparing',
        message: 'Video download is being prepared. This may take a few minutes for larger videos.',
      });
    } catch (err: any) {
      // If already exists or conflict, that's fine - continue to check for the file
      if (err.status !== 409 && err.status !== 422) {
        console.warn('Static rendition creation warning:', err.message);
      }
    }

    // Construct the download URL using Mux's standard pattern
    // Mux provides MP4 downloads at: https://stream.mux.com/{PLAYBACK_ID}/highest.mp4?download={filename}
    const downloadUrl = `https://stream.mux.com/${playbackId}/highest.mp4?download=${encodeURIComponent(filename || 'video.mp4')}`;

    return NextResponse.json({
      status: 'ready',
      downloadUrl,
      filename: filename || 'video.mp4',
    });
  } catch (error) {
    console.error('Error getting video download:', error);
    return NextResponse.json(
      { error: 'Failed to get video download' },
      { status: 500 }
    );
  }
}
