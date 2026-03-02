import { NextRequest, NextResponse } from 'next/server';
import { getAdvertiserSession, ADS_SESSION_COOKIE_NAME } from "@kolbo/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(ADS_SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = await getAdvertiserSession(token);

    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    return NextResponse.json({
      advertiser: {
        id: session.id,
        email: session.email,
        companyName: session.companyName,
        contactName: session.contactName,
      },
    });
  } catch (err) {
    console.error('Ads session error:', err);
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }
}
