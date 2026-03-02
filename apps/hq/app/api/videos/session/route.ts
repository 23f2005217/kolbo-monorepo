import { NextResponse } from 'next/server';
import { getSessionStatus, signOutOtherDevices } from "@/video-gatekeeper";

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

    const status = await getSessionStatus(deviceId);

    if (!status) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(status);
  } catch (error: any) {
    console.error('Error getting session status:', error);
    return NextResponse.json(
      { error: 'Failed to get session status', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: 'deviceId is required' },
        { status: 400 }
      );
    }

    const result = await signOutOtherDevices(deviceId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error signing out devices:', error);
    return NextResponse.json(
      { error: 'Failed to sign out devices', details: error.message },
      { status: 500 }
    );
  }
}
