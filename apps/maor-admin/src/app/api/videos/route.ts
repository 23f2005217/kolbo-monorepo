import { NextResponse } from 'next/server';
import { videoQueries } from '@kolbo/database';
import prisma from '@kolbo/database';
import Mux from '@mux/mux-node';
import { createClient } from '@supabase/supabase-js';
import { getSignedThumbnailUrl } from '@/mux-thumbnail';

import { supabase } from '@/supabase';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID || 'dummy',
  tokenSecret: process.env.MUX_TOKEN_SECRET || 'dummy',
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const subsiteSlug = 'maor';
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 10;

    const limit = pageSize;
    const offset = (page - 1) * pageSize;

    const [videos, total] = await Promise.all([
      videoQueries.findAll({
        status: status || undefined,
        search: search || undefined,
        subsiteSlug,
        limit,
        offset
      }),
      videoQueries.count({
        status: status || undefined,
        search: search || undefined,
        subsiteSlug,
      }),
    ]);

    const assetsToUpdate: Array<{ assetId: string; muxAssetId: string }> = [];

    for (const video of videos) {
      for (const asset of (video as any).assets || []) {
        if (asset.muxAssetId && !asset.muxAssetId.startsWith('temp-') && !asset.muxPlaybackId) {
          assetsToUpdate.push({ assetId: asset.id, muxAssetId: asset.muxAssetId });
        }
      }
    }

    for (const { assetId, muxAssetId } of assetsToUpdate.slice(0, 3)) {
      try {
        const muxAsset = await mux.video.assets.retrieve(muxAssetId);

        if (muxAsset && muxAsset.playback_ids && muxAsset.playback_ids.length > 0) {
          const signedPlaybackId = muxAsset.playback_ids.find((p: any) => p.policy === 'signed');
          const publicPlaybackId = muxAsset.playback_ids.find((p: any) => p.policy === 'public');
          const primaryPb = signedPlaybackId || muxAsset.playback_ids[0];

          await prisma.videoAsset.update({
            where: { id: assetId },
            data: {
              muxPlaybackId: primaryPb.id,
              muxPublicPlaybackId: publicPlaybackId?.id || null,
              playbackPolicy: primaryPb.policy || 'public',
              durationSeconds: muxAsset.duration ? Math.round(muxAsset.duration) : null,
              status: 'ready',
            },
          });

          for (const video of videos) {
            for (const asset of (video as any).assets || []) {
              if (asset.id === assetId) {
                asset.muxPlaybackId = primaryPb.id;
                asset.muxPublicPlaybackId = publicPlaybackId?.id || null;
                asset.playbackPolicy = primaryPb.policy || 'public';
                asset.durationSeconds = muxAsset.duration ? Math.round(muxAsset.duration) : null;
                asset.status = 'ready';
              }
            }
          }
        }
      } catch (e) {
        console.error(`Failed to fetch Mux asset ${muxAssetId}:`, e);
      }
    }

    const videosWithUrls = await Promise.all(videos.map(async (video: any) => {
      const horizontalImage = video.images?.find((img: any) => img.imageType === 'horizontal');
      if (horizontalImage) {
        const { data, error } = await supabase.storage
          .from(horizontalImage.storageBucket)
          .createSignedUrl(horizontalImage.storagePath, 60 * 60);

        if (!error && data) {
          return { ...video, customThumbnailUrl: data.signedUrl };
        }
      }

      const primaryAsset = video.assets?.find((a: any) => a.isPrimary) || video.assets?.[0];
      const playbackId = primaryAsset?.muxPlaybackId;
      const policy = primaryAsset?.playbackPolicy;

      if (!playbackId) return video;

      if (policy === 'signed') {
        try {
          const signedThumb = await getSignedThumbnailUrl(playbackId, { width: 200, height: 120, fitMode: 'smartcrop' });
          return { ...video, muxThumbnailUrl: signedThumb };
        } catch {
          return video;
        }
      }

      const thumbId = primaryAsset?.muxPublicPlaybackId || playbackId;
      return { ...video, muxThumbnailUrl: `https://image.mux.com/${thumbId}/thumbnail.png?width=200&height=120` };
    }));

    return NextResponse.json({
      videos: videosWithUrls,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    body.subsiteSlug = 'maor';
    const video = await videoQueries.create(body);
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const ids = body.ids || (body.id ? [body.id] : []);

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing ID(s)' },
        { status: 400 }
      );
    }

    await videoQueries.deleteMany(ids);

    return NextResponse.json({ success: true, count: ids.length });
  } catch (error) {
    console.error('Error deleting videos:', error);
    return NextResponse.json(
      { error: 'Failed to delete videos' },
      { status: 500 }
    );
  }
}
