import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedPlaybackToken } from "@/video-gatekeeper";
import { getSession, USER_SESSION_COOKIE_NAME, ADMIN_SESSION_COOKIE_NAME } from '@kolbo/auth';
import { generateDeviceId } from "@/device-fingerprint";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    const body = await request.json();
    const { deviceId, deviceName, deviceType, checkoutSessionId } = body;

    // Get user session
    const accessToken = request.cookies.get(USER_SESSION_COOKIE_NAME)?.value;
    let userId: string | null = null;

    if (accessToken) {
      const sessionData = await getSession(accessToken);
      if (sessionData && sessionData.sessionType === 'user') {
        userId = sessionData.id;
      }
    }

    // Check for admin bypass
    const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
    let isAdmin = false;
    if (adminToken) {
      const adminSession = await getSession(adminToken);
      if (adminSession && adminSession.sessionType === 'admin') {
        isAdmin = true;
      }
    }

    // Admins bypass all checks
    if (isAdmin) {
      // Generate a simple response for admins without device tracking
      const { getAuthenticatedPlaybackToken } = await import("@/video-gatekeeper");
      const result = await getAuthenticatedPlaybackToken(videoId, 'admin-device', 'Admin', 'admin', true);
      if ('error' in result) {
        return NextResponse.json(result, { status: 500 });
      }
      return NextResponse.json(result);
    }

    // Validate device ID
    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    // Call the gatekeeper for proper access control
    const result = await getAuthenticatedPlaybackToken(
      videoId,
      deviceId,
      deviceName || 'Unknown Device',
      deviceType || 'unknown'
    );

    if ('error' in result) {
      const statusCode = 
        result.error === 'UNAUTHORIZED' ? 401 :
        result.error === 'VIDEO_NOT_FOUND' ? 404 :
        result.error === 'DEVICE_LIMIT_EXCEEDED' ? 429 :
        result.error === 'GEO_BLOCKED' || result.error === 'AGE_RESTRICTED' ? 403 :
        result.error === 'NO_ENTITLEMENT' ? 403 :
        500;

      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('[PlaybackAccess] Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify access', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
