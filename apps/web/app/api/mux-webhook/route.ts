import { NextRequest, NextResponse } from 'next/server';
import prisma from "@kolbo/database";
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, object } = body;

    if (type === 'video.asset.ready') {
      const { id: muxAssetId, upload_id: muxUploadId, playback_ids } = data;

      if (!muxUploadId || !playback_ids || playback_ids.length === 0) {
        console.error('Missing muxUploadId or playback_ids in webhook payload');
        return NextResponse.json({ message: 'ok' }, { status: 200 });
      }

      const videoAsset = await prisma.videoAsset.findFirst({
        where: {
          muxUploadId: muxUploadId,
        },
      });

      if (!videoAsset) {
        console.error('Video asset not found for muxUploadId:', muxUploadId);
        return NextResponse.json({ message: 'ok' }, { status: 200 });
      }

      await prisma.videoAsset.update({
        where: {
          id: videoAsset.id,
        },
        data: {
          muxAssetId: muxAssetId,
          muxPlaybackId: playback_ids[0]?.id,
          status: 'ready',
        },
      });

    } else if (type === 'video.asset.created') {
      const { id: muxAssetId, upload_id: muxUploadId } = data;

      if (!muxUploadId) {
        console.error('Missing muxUploadId in webhook payload');
        return NextResponse.json({ message: 'ok' }, { status: 200 });
      }

      const videoAsset = await prisma.videoAsset.findFirst({
        where: {
          muxUploadId: muxUploadId,
        },
      });

      if (videoAsset) {
        await prisma.videoAsset.update({
          where: {
            id: videoAsset.id,
          },
          data: {
            muxAssetId: muxAssetId,
            status: 'preparing',
          },
        });
      }
    } else if (type === 'video.asset.errored') {
      const { id: muxAssetId, upload_id: muxUploadId, errors } = data;

      if (!muxUploadId) {
        console.error('Missing muxUploadId in webhook payload');
        return NextResponse.json({ message: 'ok' }, { status: 200 });
      }

      const videoAsset = await prisma.videoAsset.findFirst({
        where: {
          muxUploadId: muxUploadId,
        },
      });

      if (videoAsset) {
        await prisma.videoAsset.update({
          where: {
            id: videoAsset.id,
          },
          data: {
            status: 'errored',
          },
        });
        console.error('Video asset error:', errors);
      }
    }

    return NextResponse.json({ message: 'ok' }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
