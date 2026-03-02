import { NextResponse } from 'next/server';
import prisma from "@kolbo/database";
import Mux from '@mux/mux-node';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { videoId, muxUploadId } = await request.json();

    if (!videoId || !muxUploadId) {
      return NextResponse.json(
        { error: 'Video ID and Mux Upload ID are required' },
        { status: 400 }
      );
    }

    // Poll Mux for the asset ID
    let upload = await mux.video.uploads.retrieve(muxUploadId);
    let attempts = 0;
    const maxAttempts = 30;

    while (!upload.asset_id && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      upload = await mux.video.uploads.retrieve(muxUploadId);
      attempts++;
    }

    if (!upload.asset_id) {
      return NextResponse.json(
        { error: 'Asset not ready yet' },
        { status: 202 }
      );
    }

    // Get asset details
    const asset = await mux.video.assets.retrieve(upload.asset_id);
    const playbackId = asset.playback_ids?.[0]?.id;

    // Delete existing assets for this video
    await prisma.videoAsset.deleteMany({
      where: { videoId },
    });

    // Create new asset record
    await prisma.videoAsset.create({
      data: {
        videoId,
        muxAssetId: upload.asset_id,
        muxUploadId,
        muxPlaybackId: playbackId,
        durationSeconds: asset.duration ? Math.round(asset.duration) : null,
        status: playbackId ? 'ready' : 'preparing',
        isPrimary: true,
      },
    });

    return NextResponse.json({
      assetId: upload.asset_id,
      playbackId,
      status: playbackId ? 'ready' : 'processing',
    });
  } catch (error) {
    console.error('Error updating Mux asset:', error);
    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    );
  }
}
