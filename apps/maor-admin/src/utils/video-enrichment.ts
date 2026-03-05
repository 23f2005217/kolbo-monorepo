import { supabase } from '@/supabase';
import { getSignedThumbnailUrl } from '@/mux-thumbnail';

export async function enrichVideoWithThumbnail(video: any) {
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
}

export async function enrichVideosWithThumbnails(videos: any[]) {
  return Promise.all(videos.map(enrichVideoWithThumbnail));
}

export async function enrichPlaylistThumbnail(playlist: any) {
  if (playlist.thumbnailStorageBucket && playlist.thumbnailStoragePath) {
    const { data, error } = await supabase.storage
      .from(playlist.thumbnailStorageBucket)
      .createSignedUrl(playlist.thumbnailStoragePath, 60 * 60);

    if (!error && data) {
      return { ...playlist, thumbnailUrl: data.signedUrl };
    }
  }
  return playlist;
}
