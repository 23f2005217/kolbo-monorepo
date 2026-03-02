import { NextRequest, NextResponse } from 'next/server';
import { destroySession, USER_SESSION_COOKIE_NAME } from "@kolbo/auth";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(USER_SESSION_COOKIE_NAME)?.value;

    if (token) {
      await destroySession(token);
    }

    const response = NextResponse.json({ message: 'Logged out successfully' });

    response.cookies.delete(USER_SESSION_COOKIE_NAME);

    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
