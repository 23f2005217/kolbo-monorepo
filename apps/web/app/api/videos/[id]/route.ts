import { NextResponse } from 'next/server';
import { videoQueries } from "@kolbo/database";
import prisma from "@kolbo/database";
import Mux from '@mux/mux-node';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const video = await videoQueries.findById(id);
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Check if any asset is missing playbackId - fetch from Mux API as fallback
    const assetsNeedingUpdate = video.assets?.filter(
      (asset: any) => asset.muxAssetId && !asset.muxAssetId.startsWith('temp-') && !asset.muxPlaybackId
    );

    if (assetsNeedingUpdate && assetsNeedingUpdate.length > 0) {
      for (const asset of assetsNeedingUpdate) {
        try {
          // Fetch asset details from Mux
          const muxAsset = await mux.video.assets.retrieve(asset.muxAssetId);
          
          if (muxAsset && muxAsset.playback_ids && muxAsset.playback_ids.length > 0) {
            const playbackId = muxAsset.playback_ids[0].id;
            const duration = muxAsset.duration;
            
            // Update the database
            await prisma.videoAsset.update({
              where: { id: asset.id },
              data: {
                muxPlaybackId: playbackId,
                durationSeconds: duration ? Math.round(duration) : null,
                status: 'ready',
              },
            });
            
            // Update the in-memory object
            asset.muxPlaybackId = playbackId;
            asset.durationSeconds = duration ? Math.round(duration) : null;
            asset.status = 'ready';
          }
        } catch (muxError) {
          console.error(`Failed to fetch Mux asset ${asset.muxAssetId}:`, muxError);
        }
      }
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const video = await videoQueries.update(id, body);
    return NextResponse.json(video);
  } catch (error: any) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update video', 
        details: error.message,
        prismaCode: error.code,
        prismaMeta: error.meta
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await videoQueries.delete(id);
    return NextResponse.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}
