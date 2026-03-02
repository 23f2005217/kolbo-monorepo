import Mux from '@mux/mux-node';
import { NextResponse, NextRequest } from 'next/server';
import prisma from "@kolbo/database";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

async function pollUploadStatus(uploadId: string, maxAttempts = 30): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    const upload = await mux.video.uploads.retrieve(uploadId);
    
    if (upload.status === 'asset_created') {
      return upload;
    }
    
    if (upload.status === 'errored' || upload.status === 'cancelled') {
      throw new Error(`Upload ${upload.status}`);
    }
    
    // Wait 1 second before polling again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Upload polling timeout');
}

async function pollAssetStatus(assetId: string, maxAttempts = 60): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    const asset = await mux.video.assets.retrieve(assetId);
    
    if (asset.status === 'ready') {
      return asset;
    }
    
    if (asset.status === 'errored') {
      throw new Error('Asset processing failed');
    }
    
    // Wait 2 seconds before polling again
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Asset processing timeout');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uploadId, videoId } = body;

    if (!uploadId || !videoId) {
      return NextResponse.json(
        { error: 'Missing uploadId or videoId' },
        { status: 400 }
      );
    }

    // Step 1: Poll upload until asset is created
    const upload = await pollUploadStatus(uploadId);
    const assetId = upload.asset_id;

    // Step 2: Update database with asset ID
    await prisma.videoAsset.updateMany({
      where: { muxUploadId: uploadId },
      data: {
        muxAssetId: assetId,
        status: 'preparing',
      },
    });

    // Step 3: Poll asset until it's ready
    const asset = await pollAssetStatus(assetId);
    const muxPlaybackId = asset.playback_ids?.[0]?.id;

    if (!muxPlaybackId) {
      throw new Error('No playback ID found');
    }

    await prisma.videoAsset.updateMany({
      where: { muxAssetId: assetId },
      data: {
        muxPlaybackId,
        durationSeconds: asset.duration ? Math.round(asset.duration) : null,
        status: 'ready',
      },
    });

    return NextResponse.json({
      success: true,
      assetId,
      muxPlaybackId,
      duration: asset.duration,
    });
  } catch (error: any) {
    console.error('Error polling upload status:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process upload',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
