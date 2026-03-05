import { supabase } from '../supabase';

export async function enrichVideoWithThumbnail(video: any) {
  // Check for custom thumbnails first
  if (video.images && video.images.length > 0) {
    const horizontal = video.images.find((img: any) => img.imageType === 'horizontal');
    if (horizontal && horizontal.storageBucket && horizontal.storagePath) {
      const { data, error } = await supabase.storage
        .from(horizontal.storageBucket)
        .createSignedUrl(horizontal.storagePath, 60 * 60);

      if (!error && data) {
        return { ...video, customThumbnailUrl: data.signedUrl };
      }
    }
  }

  // Fallback to Mux thumbnail if assets exist
  if (video.assets && video.assets.length > 0) {
    const asset = video.assets.find((a: any) => a.muxPlaybackId || a.muxPublicPlaybackId);
    const playbackId = asset?.muxPublicPlaybackId || asset?.muxPlaybackId;
    if (playbackId) {
      return { 
        ...video, 
        muxThumbnailUrl: `https://image.mux.com/${playbackId}/thumbnail.jpg?width=640&height=360&fit_mode=preserve` 
      };
    }
  }

  return video;
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
