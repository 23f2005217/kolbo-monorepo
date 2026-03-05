import Mux from '@mux/mux-node';
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@kolbo/database';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID || 'dummy',
  tokenSecret: process.env.MUX_TOKEN_SECRET || 'dummy',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename } = body;

    // Get or create the maor subsite
    let subsite = await prisma.subsite.findUnique({
      where: { slug: 'maor' },
    });

    if (!subsite) {
      subsite = await prisma.subsite.create({
        data: {
          name: 'MyMaor',
          slug: 'maor',
          isActive: true,
        },
      });
    }

    const directUpload = await mux.video.uploads.create({
      cors_origin: '*',
      new_asset_settings: {
        playback_policy: ['signed'],
        video_quality: 'basic',
      },
    });

    const defaultTitle = filename 
      ? filename.replace(/\.[^/.]+$/, '')
      : 'Untitled Video';

    const video = await prisma.video.create({
      data: {
        title: defaultTitle,
        slug: `video-${Date.now()}`,
        status: 'unpublished',
        subsiteId: subsite.id,
      },
    });

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
    
    return NextResponse.json(
      { 
        error: 'Failed to create upload URL',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
