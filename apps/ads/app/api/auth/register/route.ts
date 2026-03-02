import { NextRequest, NextResponse } from 'next/server';
import prisma from "@kolbo/database";
import { hashPassword } from "@kolbo/auth";
import { createSession, ADS_SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@kolbo/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, contactName, companyName } = await request.json();

    if (!email || !password || !contactName || !companyName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const existing = await prisma.advertiserAccount.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const advertiser = await prisma.advertiserAccount.create({
      data: { email, passwordHash, contactName, companyName },
    });

    const sessionData = {
      id: advertiser.id,
      email: advertiser.email,
      companyName: advertiser.companyName,
      contactName: advertiser.contactName,
      createdAt: Date.now(),
      sessionType: 'advertiser' as const,
    };

    const token = await createSession(sessionData as any);

    const response = NextResponse.json({
      advertiser: { id: advertiser.id, email: advertiser.email, companyName: advertiser.companyName },
      message: 'Account created successfully',
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
    console.error('Ads register error:', err);
    return NextResponse.json({ error: 'Unable to create account. Please try again.' }, { status: 500 });
  }
}
