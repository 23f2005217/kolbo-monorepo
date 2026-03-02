import { NextRequest, NextResponse } from 'next/server';
import prisma from "@kolbo/database";
import { hashPassword } from '@/lib/auth/password';
import { createSession, USER_SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@kolbo/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, dateOfBirth, country } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (!dateOfBirth) {
      return NextResponse.json({ error: 'Date of birth is required' }, { status: 400 });
    }

    if (!country || country.length !== 2) {
      return NextResponse.json({ error: 'Country is required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || email.split('@')[0],
        dateOfBirth: new Date(dateOfBirth),
        country: country.toUpperCase(),
      },
    });

    const sessionData = {
      id: user.id,
      email: user.email,
      name: user.name || '',
      createdAt: Date.now(),
      sessionType: 'user' as const,
    };

    const token = await createSession(sessionData);

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: 'Account created successfully',
    });

    response.cookies.set(USER_SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
