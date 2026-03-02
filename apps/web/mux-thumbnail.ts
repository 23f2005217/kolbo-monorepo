import { mux, isMuxSigningConfigured } from "@/mux-client";

export async function getSignedThumbnailUrl(
  playbackId: string,
  options?: { width?: number; height?: number; fitMode?: string; time?: number }
): Promise<string> {
  if (!isMuxSigningConfigured()) {
    const params = new URLSearchParams();
    if (options?.width) params.set('width', String(options.width));
    if (options?.height) params.set('height', String(options.height));
    if (options?.fitMode) params.set('fit_mode', options.fitMode);
    if (options?.time) params.set('time', String(options.time));
    const qs = params.toString();
    return `https://image.mux.com/${playbackId}/thumbnail.jpg${qs ? `?${qs}` : ''}`;
  }

  try {
    const jwtParams: Record<string, string> = {};
    if (options?.width) jwtParams.width = String(options.width);
    if (options?.height) jwtParams.height = String(options.height);
    if (options?.fitMode) jwtParams.fit_mode = options.fitMode;
    if (options?.time) jwtParams.time = String(options.time);

    const token = await mux.jwt.signPlaybackId(playbackId, {
      type: 'thumbnail',
      expiration: '24h',
      params: Object.keys(jwtParams).length > 0 ? jwtParams : undefined,
    });

    return `https://image.mux.com/${playbackId}/thumbnail.jpg?token=${token}`;
  } catch (error) {
    console.error('Failed to sign thumbnail URL:', error);
    return `https://image.mux.com/${playbackId}/thumbnail.jpg`;
  }
}
