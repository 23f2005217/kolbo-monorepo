export type GatingType = 'free' | 'free_with_ads' | 'subscription_only' | 'rental_or_purchase';

export interface AdConfig {
  hasAds: boolean;
  adsMode?: 'free_with_ads' | 'cheaper_with_ads';
  adsPlacement?: ('pre_roll' | 'mid_roll')[];
  midRollIntervalMinutes?: number;
  adTagUrl?: string;
}

export interface PlaybackAccessResult {
  accessGranted: boolean;
  playbackId: string | null;
  playbackUrl: string | null;
  videoToken: string | null;
  thumbnailToken: string | null;
  thumbnailPlaybackId: string | null;
  tokenExpiresAt: string;
  entitlementType: 'free' | 'rental' | 'purchase' | 'subscription';
  isSignedUrl: boolean;
  adConfig?: AdConfig;
  error?: GatekeeperError;
}

export interface DeviceSession {
  deviceId: string;
  deviceName: string | null;
  deviceType: string | null;
  lastActive: string;
}

export interface SessionStatus {
  totalActive: number;
  maxAllowed: number;
  currentDevice: DeviceSession | null;
  otherDevices: DeviceSession[];
  hasExceededLimit: boolean;
}

export enum GatekeeperError {
  UNAUTHORIZED = 'UNAUTHORIZED',
  VIDEO_NOT_FOUND = 'VIDEO_NOT_FOUND',
  NO_ENTITLEMENT = 'NO_ENTITLEMENT',
  ENTITLEMENT_EXPIRED = 'ENTITLEMENT_EXPIRED',
  DEVICE_LIMIT_EXCEEDED = 'DEVICE_LIMIT_EXCEEDED',
  GEO_BLOCKED = 'GEO_BLOCKED',
  AGE_RESTRICTED = 'AGE_RESTRICTED',
  SESSION_REVOKED = 'SESSION_REVOKED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface GatekeeperErrorResponse {
  error: GatekeeperError;
  message: string;
  details?: Record<string, unknown>;
}
