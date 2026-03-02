import { NextRequest, NextResponse } from 'next/server';
import { destroySession, ADMIN_SESSION_COOKIE_NAME } from '@kolbo/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (token) {
    await destroySession(token);
  }

  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.delete(ADMIN_SESSION_COOKIE_NAME);

  return response;
}
