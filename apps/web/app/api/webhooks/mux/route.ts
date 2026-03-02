import { NextResponse } from 'next/server';
import prisma from "@kolbo/database";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'video.upload.asset_created': {
        // Update videoAsset with muxAssetId when asset is created
        if (data.upload_id) {
          await prisma.videoAsset.updateMany({
            where: { muxUploadId: data.upload_id },
            data: {
              muxAssetId: data.asset_id,
              status: 'preparing',
            },
          });
        }
        break;
      }
      case 'video.asset.ready': {
        // Update videoAsset with playbackId and duration when ready
        const playbackId = data.playback_ids?.[0]?.id;
        if (data.id) {
          await prisma.videoAsset.updateMany({
            where: { muxAssetId: data.id },
            data: {
              muxPlaybackId: playbackId,
              durationSeconds: Math.round(data.duration || 0),
              status: 'ready',
            },
          });
        }
        break;
      }
      case 'video.upload.cancelled': {
        if (data.id) {
          await prisma.videoAsset.updateMany({
            where: { muxUploadId: data.id },
            data: { status: 'errored' },
          });
        }
        break;
      }
      case 'video.upload.errored': {
        if (data.id) {
          await prisma.videoAsset.updateMany({
            where: { muxUploadId: data.id },
            data: { status: 'errored' },
          });
        }
        break;
      }
      case 'video.asset.errored': {
        if (data.id) {
          await prisma.videoAsset.updateMany({
            where: { muxAssetId: data.id },
            data: { status: 'errored' },
          });
        }
        break;
      }
      default:
        // Unhandled webhook type
        break;
    }

    return NextResponse.json({ message: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
