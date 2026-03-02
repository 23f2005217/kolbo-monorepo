import { NextRequest, NextResponse } from 'next/server';
import { destroySession, getAdvertiserSession, ADS_SESSION_COOKIE_NAME } from "@kolbo/auth";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(ADS_SESSION_COOKIE_NAME)?.value;

    if (token) {
      await destroySession(token);
    }

    const response = NextResponse.json({ message: 'Logged out' });
    response.cookies.delete(ADS_SESSION_COOKIE_NAME);

    return response;
  } catch (err) {
    console.error('Ads logout error:', err);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
