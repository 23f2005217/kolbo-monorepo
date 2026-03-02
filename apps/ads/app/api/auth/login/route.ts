import { NextRequest, NextResponse } from 'next/server';
import { validateAdvertiserCredentials, createSession, ADS_SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@kolbo/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const sessionData = await validateAdvertiserCredentials(email, password);

    if (!sessionData) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await createSession(sessionData as any);

    const response = NextResponse.json({
      advertiser: {
        id: sessionData.id,
        email: sessionData.email,
        companyName: sessionData.companyName,
      },
    });

    response.cookies.set(ADS_SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (err) {
    console.error('Ads login error:', err);
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }
}
