import prisma from '@kolbo/database';
import { verifyPassword } from './password';
import { createSession, destroySession } from './session';
import { ADS_SESSION_COOKIE_NAME, SESSION_MAX_AGE } from './constants';

export interface AdvertiserSessionData {
  id: string;
  email: string;
  companyName: string;
  contactName: string;
  createdAt: number;
  sessionType: 'advertiser';
}

export async function validateAdvertiserCredentials(
  email: string,
  password: string
): Promise<AdvertiserSessionData | null> {
  const advertiser = await prisma.advertiserAccount.findUnique({
    where: { email },
  });

  if (!advertiser || advertiser.status === 'suspended') {
    return null;
  }

  const isValid = await verifyPassword(password, advertiser.passwordHash);

  if (!isValid) {
    return null;
  }

  return {
    id: advertiser.id,
    email: advertiser.email,
    companyName: advertiser.companyName,
    contactName: advertiser.contactName,
    createdAt: Date.now(),
    sessionType: 'advertiser',
  };
}

export async function getAdvertiserSession(
  token: string
): Promise<AdvertiserSessionData | null> {
  const row = await prisma.session.findUnique({ where: { token } });

  if (!row || new Date() > row.expiresAt) {
    if (row) {
      await prisma.session.delete({ where: { token } }).catch(() => {});
    }
    return null;
  }

  const data = row.data as unknown as AdvertiserSessionData;

  if (!data || data.sessionType !== 'advertiser') {
    return null;
  }

  return data;
}

export { createSession, destroySession, ADS_SESSION_COOKIE_NAME, SESSION_MAX_AGE };
