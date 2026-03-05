import { NextRequest, NextResponse } from 'next/server';
import { destroySession, ADMIN_SESSION_COOKIE_NAME, USER_SESSION_COOKIE_NAME } from '@kolbo/auth';

export async function POST(request: NextRequest) {
  // Destroy admin session if exists
  const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (adminToken) {
    await destroySession(adminToken);
  }

  // Destroy user session if exists
  const userToken = request.cookies.get(USER_SESSION_COOKIE_NAME)?.value;
  if (userToken) {
    await destroySession(userToken);
  }

  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.delete(ADMIN_SESSION_COOKIE_NAME);
  response.cookies.delete(USER_SESSION_COOKIE_NAME);

  return response;
}
