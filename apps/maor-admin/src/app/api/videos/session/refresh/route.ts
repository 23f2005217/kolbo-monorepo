import { NextResponse } from 'next/server';
import { refreshSession } from "@/video-gatekeeper";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId is required' },
        { status: 400 }
      );
    }

    const result = await refreshSession(deviceId);

    if (!result.success) {
      const statusCode = result.error === 'UNAUTHORIZED' ? 401 : 500;
      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in session refresh:', error);
    return NextResponse.json(
      { error: 'Failed to refresh session', details: error.message },
      { status: 500 }
    );
  }
}
