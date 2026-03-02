import { NextResponse } from 'next/server';
import { getAuthenticatedPlaybackToken } from "@/video-gatekeeper";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoId, deviceId, deviceName, deviceType } = body;

    if (!videoId || !deviceId) {
      return NextResponse.json(
        { error: 'videoId and deviceId are required' },
        { status: 400 }
      );
    }

    const result = await getAuthenticatedPlaybackToken(
      videoId,
      deviceId,
      deviceName,
      deviceType
    );

    if ('error' in result) {
      const statusCode = result.error === 'UNAUTHORIZED' ? 401 :
                        result.error === 'VIDEO_NOT_FOUND' ? 404 :
                        result.error === 'DEVICE_LIMIT_EXCEEDED' ? 429 :
                        result.error === 'GEO_BLOCKED' || result.error === 'AGE_RESTRICTED' ? 403 :
                        500;

      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in playback-access:', error);
    return NextResponse.json(
      { error: 'Failed to get playback access', details: error.message },
      { status: 500 }
    );
  }
}
