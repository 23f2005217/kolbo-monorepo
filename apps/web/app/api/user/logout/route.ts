import { NextRequest, NextResponse } from 'next/server';
import { destroySession, USER_SESSION_COOKIE_NAME } from "@kolbo/auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(USER_SESSION_COOKIE_NAME)?.value;

  if (token) {
    await destroySession(token);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(USER_SESSION_COOKIE_NAME);

  return response;
}

