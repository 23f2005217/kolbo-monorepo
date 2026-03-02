import { randomBytes } from 'crypto';
import prisma from '@kolbo/database';
import { verifyPassword } from './password';

export type AdminRole = 'super_admin' | 'admin';

export interface SessionData {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  createdAt: number;
  sessionType: 'admin' | 'user';
}

export interface UserSessionData {
  id: string;
  email: string;
  name: string;
  createdAt: number;
  sessionType: 'admin' | 'user';
}

export async function validateAdminCredentials(email: string, password: string): Promise<SessionData | null> {
  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin || !admin.isActive) {
    return null;
  }

  const isValid = await verifyPassword(password, admin.passwordHash);
  
  if (!isValid) {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
    displayName: admin.displayName,
    role: admin.role,
    createdAt: Date.now(),
    sessionType: 'admin',
  };
}

export async function validateUserCredentials(email: string, password: string): Promise<UserSessionData | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name || '',
    createdAt: Date.now(),
    sessionType: 'user',
  };
}

export async function createSession(data: SessionData | UserSessionData): Promise<string> {
  const token = randomBytes(32).toString('hex');
  
  await prisma.session.create({
    data: {
      token,
      data: data as any,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000),
    },
  });
  
  return token;
}

export async function getSession(token: string): Promise<SessionData | UserSessionData | null> {
  const session = await prisma.session.findUnique({
    where: { token },
  });

  if (!session || new Date() > session.expiresAt) {
    if (session) {
      await prisma.session.delete({ where: { token } });
    }
    return null;
  }

  return session.data as unknown as SessionData | UserSessionData;
}

export async function destroySession(token: string): Promise<void> {
  try {
    await prisma.session.delete({
      where: { token },
    });
  } catch (error) {
  }
}

import { ADMIN_SESSION_COOKIE_NAME, USER_SESSION_COOKIE_NAME, SESSION_MAX_AGE } from './constants';

export { ADMIN_SESSION_COOKIE_NAME, USER_SESSION_COOKIE_NAME, SESSION_MAX_AGE };

