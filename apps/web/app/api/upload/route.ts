import Mux from '@mux/mux-node';
import { NextResponse, NextRequest } from 'next/server';
import prisma from "@kolbo/database";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, subsiteId, videoId, isAd } = body;

    const directUpload = await mux.video.uploads.create({
      cors_origin: '*',
      new_asset_settings: {
        playback_policy: isAd ? ['public'] : ['signed'],
        video_quality: 'basic',
      },
    });

    // If videoId is provided, this is a replacement - just return upload URL
    if (videoId) {
      return NextResponse.json({
        url: directUpload.url,
        id: directUpload.id,
        videoId,
      });
    }

    // If it's an ad creative, we don't need to create a Video/VideoAsset yet.
    if (isAd) {
      return NextResponse.json({
        uploadUrl: directUpload.url,
        uploadId: directUpload.id,
      });
    }

    // Otherwise, create new video record
    const defaultTitle = filename 
      ? filename.replace(/\.[^/.]+$/, '')
      : 'Untitled Video';

    const videoData: { title: string; slug: string; status: string; subsiteId?: string } = {
      title: defaultTitle,
      slug: `video-${Date.now()}`,
      status: 'unpublished',
    };
    if (subsiteId && subsiteId !== '') {
      videoData.subsiteId = subsiteId;
    }

    const video = await prisma.video.create({
      data: {
        title: videoData.title,
        slug: videoData.slug,
        status: 'unpublished' as const,
        ...(videoData.subsiteId !== undefined && { subsiteId: videoData.subsiteId }),
      },
    });

    // Create video asset record
    const tempAssetId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    await prisma.videoAsset.create({
      data: {
        videoId: video.id,
        muxUploadId: directUpload.id,
        muxAssetId: tempAssetId,
        status: 'preparing',
        isPrimary: true,
      },
    });

    return NextResponse.json({
      uploadUrl: directUpload.url,
      uploadId: directUpload.id,
      videoId: video.id,
    });
  } catch (error: any) {
    console.error('Error creating upload:', error);
    
    let failureStage = 'unknown';
    if (error.message?.includes('mux')) failureStage = 'mux_api';
    if (error.code === 'P2002') failureStage = 'db_unique_constraint';
    if (error.code?.startsWith('P')) failureStage = 'db_prisma';

    console.error('Failure Stage:', failureStage);
    if (error.response) {
       console.error('Mux API Error Data:', JSON.stringify(error.response.data));
    }

    return NextResponse.json(
      { 
        error: 'Failed to create upload URL',
        details: error?.message || 'Unknown error',
        stage: failureStage,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      },
      { status: 500 }
    );
  }
}
