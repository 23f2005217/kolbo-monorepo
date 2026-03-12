import { NextRequest, NextResponse } from 'next/server';
import prisma from "@kolbo/database";
import { getSession, USER_SESSION_COOKIE_NAME } from "@kolbo/auth";

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get(USER_SESSION_COOKIE_NAME)?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const sessionData = await getSession(accessToken);
    if (!sessionData || sessionData.sessionType !== 'user') {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const userId = sessionData.id;

    // Get profile with sessions
    const profile = await prisma.profile.findFirst({
      where: { userId },
      include: {
        playbackSessions: {
          orderBy: { lastActive: 'desc' },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Normalize max devices
    const maxDevices = profile.maxDevices ?? 5;

    // Manually deduplicate by deviceId
    const seenDevices = new Set();
    const distinctDevices = profile.playbackSessions.filter((session: any) => {
      if (seenDevices.has(session.deviceId)) {
        return false;
      }
      seenDevices.add(session.deviceId);
      return true;
    });

    return NextResponse.json({
      userId: userId.substring(0, 8) + '...',
      maxDevices: profile.maxDevices,
      totalSessions: profile.playbackSessions.length,
      distinctDevices: distinctDevices.length,
      devices: distinctDevices.map((d: any) => ({
        deviceId: d.deviceId.substring(0, 8) + '...',
        deviceName: d.deviceName,
        videoId: d.videoId,
        lastActive: d.lastActive.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error getting sessions:', error);
    return NextResponse.json(
      { error: 'Failed to get sessions' },
      { status: 500 }
    );
  }
}
