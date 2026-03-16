'use server';

import prisma from "@kolbo/database";
import { mux, isMuxSigningConfigured } from "@/mux-client";
import { 
  PlaybackAccessResult, 
  SessionStatus, 
  GatekeeperError,
  GatekeeperErrorResponse 
} from './types';
import { cookies, headers } from 'next/headers';
import { getSession } from "@kolbo/auth";

const MAX_DEVICES = 5;
const ACTIVE_SESSION_THRESHOLD_MINUTES = 2;
const MUX_TOKEN_EXPIRATION_MINUTES = 2;

export async function getAuthenticatedPlaybackToken(
  videoId: string,
  deviceId: string,
  deviceName?: string,
  deviceType?: string,
  isAdminBypass: boolean = false
): Promise<PlaybackAccessResult | GatekeeperErrorResponse> {
  try {
    // 1. Fetch video info first to check if it's free
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        assets: {
          where: { status: 'ready' },
          orderBy: { isPrimary: 'desc' },
        },
        geoBlocks: true,
        offers: true,
        subscriptionPlans: true,
      },
    });

    if (!video) {
      return {
        error: GatekeeperError.VIDEO_NOT_FOUND,
        message: 'Video not found',
      };
    }

    const planIds = video.subscriptionPlans.map(p => p.subscriptionPlanId);

    if (isAdminBypass) {
      const playbackAsset = video.assets.find(a => a.muxPlaybackId);
      if (!playbackAsset?.muxPlaybackId) {
        return {
          error: GatekeeperError.INTERNAL_ERROR,
          message: 'Video is not ready for playback',
        };
      }

      const signedPlaybackId = playbackAsset.muxPlaybackId;
      const hasSigningKeys = isMuxSigningConfigured() && playbackAsset.playbackPolicy === 'signed';
      let videoToken: string | null = null;
      let thumbnailToken: string | null = null;
      let signedPlaybackUrl = `https://stream.mux.com/${signedPlaybackId}.m3u8`;

      if (hasSigningKeys) {
        try {
          const tokenExpiration = `${MUX_TOKEN_EXPIRATION_MINUTES}m`;
          videoToken = await mux.jwt.signPlaybackId(signedPlaybackId, {
            type: 'video',
            expiration: tokenExpiration,
          });
          thumbnailToken = await mux.jwt.signPlaybackId(signedPlaybackId, {
            type: 'thumbnail',
            expiration: '1y',
          });
          signedPlaybackUrl = `https://stream.mux.com/${signedPlaybackId}.m3u8?token=${videoToken}`;
        } catch (error) {
          console.error('Error generating Mux signed token for admin:', error);
        }
      }

      const tokenExpiresAt = new Date(Date.now() + MUX_TOKEN_EXPIRATION_MINUTES * 60 * 1000);

      let adConfig: { hasAds: boolean; adsMode?: 'free_with_ads' | 'cheaper_with_ads'; adsPlacement?: ('pre_roll' | 'mid_roll')[]; midRollIntervalMinutes?: number; adTagUrl?: string } | undefined;
      if (video.hasAds) {
        const adsPlacementArray: ('pre_roll' | 'mid_roll')[] = video.adsPlacement ? [video.adsPlacement as 'pre_roll' | 'mid_roll'] : [];
        adConfig = {
          hasAds: video.hasAds,
          adsMode: video.adsMode as 'free_with_ads' | 'cheaper_with_ads' | undefined || undefined,
          adsPlacement: adsPlacementArray,
          midRollIntervalMinutes: video.midRollIntervalMinutes || undefined,
          adTagUrl: video.adTagUrl || undefined,
        };
      }

      return {
        accessGranted: true,
        playbackId: signedPlaybackId,
        playbackUrl: signedPlaybackUrl,
        videoToken,
        thumbnailToken,
        thumbnailPlaybackId: signedPlaybackId,
        tokenExpiresAt: tokenExpiresAt.toISOString(),
        entitlementType: 'free',
        isSignedUrl: !!hasSigningKeys,
        adConfig,
      };
    }

    // 2. Check for regional blocks (applies to everyone)
    const userCountry = await getUserCountry();
    const blockedCountries = video.geoBlocks.map(gb => gb.countryCode);
    
    if (blockedCountries.includes(userCountry)) {
      return {
        error: GatekeeperError.GEO_BLOCKED,
        message: 'This video is not available in your region',
        details: { blockedCountry: userCountry },
      };
    }

    // 3. Check authentication if needed (paid content or age restricted)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('kolbo_user_session')?.value;
    const sessionData = accessToken ? await getSession(accessToken) : null;
    const isUserAuthenticated = sessionData && sessionData.sessionType === 'user';
    const userId = isUserAuthenticated ? sessionData.id : null;

    // 4. Handle Authenticated-only checks (Profile, Age, Devices, Entitlements)
    let profile = null;
    if (userId) {
      profile = await prisma.profile.findFirst({
        where: { userId },
        include: {
          playbackSessions: {
            where: {
              lastActive: {
                gte: new Date(Date.now() - ACTIVE_SESSION_THRESHOLD_MINUTES * 60 * 1000),
              },
            },
            orderBy: { lastActive: 'desc' },
          },
        },
      });

      if (!profile) {
        profile = await prisma.profile.create({
          data: {
            userId,
            maxDevices: MAX_DEVICES,
          },
          include: {
            playbackSessions: true
          }
        });
      }
    }

    // Get distinct devices with recent activity across ALL videos for device limit check
    let recentUserDevices: string[] = [];
    if (profile) {
      const recentSessions = await prisma.playbackSession.findMany({
        where: { 
          profileId: profile.id,
          lastActive: {
            gte: new Date(Date.now() - 30 * 60 * 1000),
          },
        },
        select: { deviceId: true },
        distinct: ['deviceId'],
      });
      recentUserDevices = recentSessions.map(s => s.deviceId);
    }

    if (video.minimumAge && video.minimumAge > 0) {
      if (!isUserAuthenticated || !userId) {
        return {
          error: GatekeeperError.UNAUTHORIZED,
          message: 'This video is age-restricted. Please log in to verify your age.',
        };
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { dateOfBirth: true },
      });

      if (user?.dateOfBirth) {
        const today = new Date();
        const dob = new Date(user.dateOfBirth);
        let userAge = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
          userAge--;
        }

        if (userAge < video.minimumAge) {
          return {
            error: GatekeeperError.AGE_RESTRICTED,
            message: `This video requires age ${video.minimumAge}+ to view`,
            details: { requiredAge: video.minimumAge, userAge },
          };
        }
      }
    }

    let entitlementType: 'free' | 'rental' | 'purchase' | 'subscription' = 'free';
    let maxSimultaneousStreams: number | null = null;
    let hasAdsFromSub = false;

    if (!video.isFree) {
      if (!isUserAuthenticated || !profile || !userId) {
        return {
          error: GatekeeperError.UNAUTHORIZED,
          message: 'You must be logged in to watch this video',
        };
      }

      const vSubsiteId = video.subsiteId;
      
      // Find all plans that cover this video's subsite
      const subsitePlanIds = vSubsiteId ? (await prisma.subsiteSubscriptionPlan.findMany({
        where: { subsiteId: vSubsiteId },
        select: { subscriptionPlanId: true }
      })).map(p => p.subscriptionPlanId) : [];

      const allRelevantPlanIds = Array.from(new Set([...planIds, ...subsitePlanIds]));

      const subscriptionConditions: any[] = [];
      
      if (vSubsiteId) {
        subscriptionConditions.push(
          { subsiteId: vSubsiteId },
          { 
            bundle: {
              bundleSubsites: {
                some: { subsiteId: vSubsiteId }
              }
            }
          },
          {
            subsiteSubscriptionPlan: {
              subsiteId: vSubsiteId
            }
          }
        );
      }

      if (allRelevantPlanIds.length > 0) {
        subscriptionConditions.push(
          {
            subsiteSubscriptionPlanId: { in: allRelevantPlanIds }
          },
          {
            subsiteSubscriptionPlan: {
              subscriptionPlanId: { in: allRelevantPlanIds }
            }
          }
        );
      }

      const activeSubs = await prisma.userSubscription.findMany({
        where: {
          userId,
          status: 'active',
          OR: subscriptionConditions
        },
        include: {
          bundle: true,
        }
      });

      if (activeSubs.length > 0) {
        entitlementType = 'subscription';
        const bestSub = activeSubs.reduce((prev, curr) => {
          if ((curr.maxDevices || 0) > (prev.maxDevices || 0)) return curr;
          if (curr.hasAds === false && prev.hasAds === true) return curr;
          return prev;
        });
        maxSimultaneousStreams = bestSub.maxDevices ?? 3;
        hasAdsFromSub = bestSub.hasAds ?? false;
      } else {
        const videoAccess = await prisma.videoAccess.findFirst({
          where: {
            profileId: profile.id,
            videoId,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });

        if (!videoAccess) {
          const entitlement = await prisma.entitlement.findFirst({
            where: {
              userId,
              contentId: videoId,
              contentType: 'video',
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } },
              ],
            },
            orderBy: { createdAt: 'desc' },
          });

          if (!entitlement) {
            return {
              error: GatekeeperError.NO_ENTITLEMENT,
              message: 'You do not have access to this video. Please rent or purchase to continue.',
            };
          }

          entitlementType = entitlement.entitlementType.toLowerCase() as 'rental' | 'purchase' | 'subscription';
          maxSimultaneousStreams = (entitlement as any).maxSimultaneousStreams;
          const accessType = entitlementType === 'rental' ? 'rental' : entitlementType === 'purchase' ? 'purchase' : 'subscription';

          await prisma.videoAccess.upsert({
            where: {
              profileId_videoId_accessType: {
                profileId: profile.id,
                videoId,
                accessType,
              },
            },
            update: {
              expiresAt: entitlement.expiresAt,
              entitlementId: entitlement.id,
              maxViewers: maxSimultaneousStreams,
            },
            create: {
              profileId: profile.id,
              videoId,
              accessType,
              expiresAt: entitlement.expiresAt,
              entitlementId: entitlement.id,
              maxViewers: maxSimultaneousStreams,
            },
          });
        } else {
          entitlementType = videoAccess.accessType.toLowerCase() as 'rental' | 'purchase' | 'subscription';
          maxSimultaneousStreams = videoAccess.maxViewers;
        }
      }
    }

    // Determine device limit: entitlement -> video setting -> profile default
    const effectiveMaxDevices = maxSimultaneousStreams ?? (video as any).maxSimultaneousStreams ?? profile?.maxDevices ?? MAX_DEVICES;

    // Check if this device already has a RECENT active session (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const existingRecentSession = await prisma.playbackSession.findFirst({
      where: {
        profileId: profile?.id,
        deviceId,
        videoId,
        lastActive: {
          gte: thirtyMinutesAgo,
        },
      },
    });

    // Device limit check (only for NEW devices trying to watch)
    // Existing recent sessions are allowed to refresh tokens without re-checking limits
    if (!existingRecentSession && profile && effectiveMaxDevices > 0) {
      const isCurrentDeviceRegistered = recentUserDevices.includes(deviceId);
      const otherDevices = recentUserDevices.filter((d: string) => d !== deviceId);

      if (otherDevices.length >= effectiveMaxDevices && !isCurrentDeviceRegistered) {
        const otherSessions = await prisma.playbackSession.findMany({
          where: { 
            profileId: profile.id,
            deviceId: { in: otherDevices },
          },
          orderBy: { lastActive: 'desc' },
          take: effectiveMaxDevices,
        });

        return {
          error: GatekeeperError.DEVICE_LIMIT_EXCEEDED,
          message: `You have reached the maximum of ${effectiveMaxDevices} concurrent devices. Please sign out of other devices.`,
          details: {
            maxDevices: effectiveMaxDevices,
            activeDevices: otherDevices.length,
            devices: otherSessions.map(s => ({
              deviceId: s.deviceId,
              deviceName: s.deviceName,
              lastActive: s.lastActive.toISOString(),
            })),
          },
        };
      }
    }

    const playbackAsset = video.assets.find(a => a.muxPlaybackId);
    if (!playbackAsset?.muxPlaybackId) {
      return {
        error: GatekeeperError.INTERNAL_ERROR,
        message: 'Video is not ready for playback',
      };
    }

    const signedPlaybackId = playbackAsset.muxPlaybackId;
    
    let videoToken: string | null = null;
    let thumbnailToken: string | null = null;
    let signedPlaybackUrl: string;

    const hasSigningKeys = isMuxSigningConfigured() && playbackAsset.playbackPolicy === 'signed';

    if (hasSigningKeys) {
      try {
        const tokenExpiration = `${MUX_TOKEN_EXPIRATION_MINUTES}m`;

        videoToken = await mux.jwt.signPlaybackId(signedPlaybackId, {
          type: 'video',
          expiration: tokenExpiration,
        });

        thumbnailToken = await mux.jwt.signPlaybackId(signedPlaybackId, {
          type: 'thumbnail',
          expiration: '1y',
        });

        signedPlaybackUrl = `https://stream.mux.com/${signedPlaybackId}.m3u8?token=${videoToken}`;
      } catch (error) {
        console.error('Error generating Mux signed token:', error);
        signedPlaybackUrl = `https://stream.mux.com/${signedPlaybackId}.m3u8`;
      }
    } else {
      signedPlaybackUrl = `https://stream.mux.com/${signedPlaybackId}.m3u8`;
    }

    const tokenExpiresAt = new Date(Date.now() + MUX_TOKEN_EXPIRATION_MINUTES * 60 * 1000);

    if (profile) {
      const currentSession = profile.playbackSessions.find((s: any) => s.deviceId === deviceId);
      
      await prisma.playbackSession.upsert({
        where: {
          id: currentSession?.id || '00000000-0000-0000-0000-000000000000',
        },
        update: {
          lastActive: new Date(),
          videoId,
          muxPlaybackId: signedPlaybackId,
          ipAddress: await getClientIP(),
          countryCode: userCountry,
        },
        create: {
          profileId: profile.id,
          deviceId,
          deviceName: deviceName || 'Unknown Device',
          deviceType: deviceType || 'unknown',
          videoId,
          muxPlaybackId: signedPlaybackId,
          ipAddress: await getClientIP(),
          countryCode: userCountry,
        },
      });
    }

    let adConfig: { hasAds: boolean; adsMode?: 'free_with_ads' | 'cheaper_with_ads'; adsPlacement?: ('pre_roll' | 'mid_roll')[]; midRollIntervalMinutes?: number; adTagUrl?: string } | undefined;
    if (video.hasAds || hasAdsFromSub) {
      const adsPlacementArray: ('pre_roll' | 'mid_roll')[] = video.adsPlacement ? [video.adsPlacement as 'pre_roll' | 'mid_roll'] : [];
      adConfig = {
        hasAds: true,
        adsMode: video.adsMode as 'free_with_ads' | 'cheaper_with_ads' | undefined || undefined,
        adsPlacement: adsPlacementArray,
        midRollIntervalMinutes: video.midRollIntervalMinutes || undefined,
        adTagUrl: video.adTagUrl || undefined,
      };
    }

    return {
      accessGranted: true,
      playbackId: signedPlaybackId,
      playbackUrl: signedPlaybackUrl,
      videoToken,
      thumbnailToken,
      thumbnailPlaybackId: signedPlaybackId,
      tokenExpiresAt: tokenExpiresAt.toISOString(),
      entitlementType,
      isSignedUrl: !!hasSigningKeys,
      adConfig,
    };

  } catch (error) {
    console.error('[Gatekeeper] Error:', error);
    return {
      error: GatekeeperError.INTERNAL_ERROR,
      message: 'An unexpected error occurred. Please try again.',
      details: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

export async function refreshSession(
  deviceId: string
): Promise<{ success: boolean; error?: GatekeeperError; message?: string }> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('kolbo_user_session')?.value;
    
    if (!accessToken) {
      return {
        success: false,
        error: GatekeeperError.UNAUTHORIZED,
        message: 'Session expired',
      };
    }

    const sessionData = await getSession(accessToken);
    if (!sessionData || sessionData.sessionType !== 'user') {
      return {
        success: false,
        error: GatekeeperError.UNAUTHORIZED,
        message: 'Invalid session',
      };
    }

    const userId = sessionData.id;
    const profile = await prisma.profile.findFirst({
      where: { userId },
    });

    if (!profile) {
      return {
        success: false,
        error: GatekeeperError.UNAUTHORIZED,
        message: 'Profile not found',
      };
    }

    await prisma.playbackSession.updateMany({
      where: {
        profileId: profile.id,
        deviceId,
      },
      data: {
        lastActive: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Refresh session error:', error);
    return {
      success: false,
      error: GatekeeperError.INTERNAL_ERROR,
      message: 'Failed to refresh session',
    };
  }
}

export async function signOutOtherDevices(
  currentDeviceId: string
): Promise<{ success: boolean; signedOutCount: number }> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('kolbo_user_session')?.value;
    
    if (!accessToken) {
      return { success: false, signedOutCount: 0 };
    }

    const sessionData = await getSession(accessToken);
    if (!sessionData || sessionData.sessionType !== 'user') {
      return { success: false, signedOutCount: 0 };
    }

    const userId = sessionData.id;
    const profile = await prisma.profile.findFirst({
      where: { userId },
    });

    if (!profile) {
      return { success: false, signedOutCount: 0 };
    }

    const result = await prisma.playbackSession.deleteMany({
      where: {
        profileId: profile.id,
        deviceId: { not: currentDeviceId },
      },
    });

    return { success: true, signedOutCount: result.count };
  } catch (error) {
    console.error('Sign out other devices error:', error);
    return { success: false, signedOutCount: 0 };
  }
}

export async function getSessionStatus(deviceId: string): Promise<SessionStatus | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('kolbo_user_session')?.value;
    
    if (!accessToken) return null;

    const sessionData = await getSession(accessToken);
    if (!sessionData || sessionData.sessionType !== 'user') return null;

    const userId = sessionData.id;
    const profile = await prisma.profile.findFirst({
      where: { userId },
      include: {
        playbackSessions: {
          where: {
            lastActive: {
              gte: new Date(Date.now() - ACTIVE_SESSION_THRESHOLD_MINUTES * 60 * 1000),
            },
          },
          orderBy: { lastActive: 'desc' },
        },
      },
    });

    if (!profile) return null;

    const currentSession = profile.playbackSessions.find(s => s.deviceId === deviceId);
    const otherDevices = profile.playbackSessions.filter(s => s.deviceId !== deviceId);

    return {
      totalActive: profile.playbackSessions.length,
      maxAllowed: profile.maxDevices || 5,
      currentDevice: currentSession ? {
        deviceId: currentSession.deviceId,
        deviceName: currentSession.deviceName,
        deviceType: currentSession.deviceType,
        lastActive: currentSession.lastActive.toISOString(),
      } : null,
      otherDevices: otherDevices.map(s => ({
        deviceId: s.deviceId,
        deviceName: s.deviceName,
        deviceType: s.deviceType,
        lastActive: s.lastActive.toISOString(),
      })),
      hasExceededLimit: otherDevices.length >= (profile.maxDevices || 5) && !currentSession,
    };
  } catch (error) {
    console.error('Get session status error:', error);
    return null;
  }
}

async function getUserCountry(): Promise<string> {
  try {
    const headersList = await headers();
    return headersList.get('x-vercel-ip-country')
      || headersList.get('cf-ipcountry')
      || 'US';
  } catch {
    return 'US';
  }
}

async function getClientIP(): Promise<string> {
  try {
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return headersList.get('x-real-ip') || '0.0.0.0';
  } catch {
    return '0.0.0.0';
  }
}
