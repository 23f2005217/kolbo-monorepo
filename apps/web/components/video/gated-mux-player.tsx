'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { useRouter } from 'next/navigation';
import { generateDeviceId, getDeviceInfo } from "@/device-fingerprint";
import { GatekeeperError } from '@/video-gatekeeper/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AdConfig {
  hasAds: boolean;
  adsMode?: 'free_with_ads' | 'cheaper_with_ads';
  adsPlacement?: ('pre_roll' | 'mid_roll')[];
  midRollIntervalMinutes?: number;
  adTagUrl?: string;
}

interface GatedMuxPlayerProps {
  videoId: string;
  onError?: (error: { type: GatekeeperError; message: string }) => void;
}

const HEARTBEAT_INTERVAL_MS = 45000;
const TOKEN_REFRESH_BUFFER_MS = 30000;

function buildAdSchedule(adConfig: AdConfig): Record<string, { offset: number | string; tag: string }[]> {
  const schedule: Record<string, { offset: number | string; tag: string }[]> = {};
  const adTagUrl = adConfig.adTagUrl || '';
  const placements = adConfig.adsPlacement || [];

  // Pre-roll ads
  if (placements.includes('pre_roll')) {
    schedule.preroll = [{ offset: 0, tag: adTagUrl }];
  }

  // Mid-roll ads at specified intervals
  if (placements.includes('mid_roll') && adConfig.midRollIntervalMinutes && adConfig.midRollIntervalMinutes > 0) {
    const midrolls: { offset: number; tag: string }[] = [];
    // Generate midrolls at specified intervals (e.g., every 10 minutes)
    for (let offset = adConfig.midRollIntervalMinutes; offset < 60; offset += adConfig.midRollIntervalMinutes) {
      midrolls.push({ offset, tag: adTagUrl });
    }
    if (midrolls.length > 0) {
      schedule.midroll = midrolls;
    }
  }

  return schedule;
}

export function GatedMuxPlayer({ videoId, onError }: GatedMuxPlayerProps) {
  const router = useRouter();
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [playbackId, setPlaybackId] = useState<string | null>(null);
  const [thumbnailPlaybackId, setThumbnailPlaybackId] = useState<string | null>(null);
  const [adConfig, setAdConfig] = useState<AdConfig | undefined>(undefined);
  const [tokens, setTokens] = useState<{ playback: string | null; thumbnail: string | null }>({
    playback: null,
    thumbnail: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ type: GatekeeperError; message: string } | null>(null);
  const [showDeviceLimitModal, setShowDeviceLimitModal] = useState(false);
  const [otherDevices, setOtherDevices] = useState<Array<{ deviceId: string; deviceName: string | null }>>([]);
  
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const tokenExpiryRef = useRef<Date | null>(null);
  const deviceIdRef = useRef<string>('');

  const fetchPlaybackToken = useCallback(async () => {
    setLoading(true);
    setError(null);

    const deviceId = generateDeviceId();
    deviceIdRef.current = deviceId;
    const { deviceName, deviceType } = getDeviceInfo();

    try {
      const response = await fetch('/api/videos/playback-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, deviceId, deviceName, deviceType }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setError({ type: result.error, message: result.message });
        setLoading(false);
        
        if (result.error === 'DEVICE_LIMIT_EXCEEDED') {
          setOtherDevices(result.details?.devices || []);
          setShowDeviceLimitModal(true);
        }
        
        onError?.({ type: result.error, message: result.message });
        return;
      }

      setPlaybackUrl(result.playbackUrl);
      setPlaybackId(result.playbackId);
      setThumbnailPlaybackId(result.thumbnailPlaybackId);
      setAdConfig(result.adConfig);
      setTokens({
        playback: result.videoToken,
        thumbnail: result.thumbnailToken,
      });
      tokenExpiryRef.current = new Date(result.tokenExpiresAt);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch playback token';
      setError({ type: GatekeeperError.INTERNAL_ERROR, message: errorMessage });
      setLoading(false);
    }
  }, [videoId, onError]);

  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

    heartbeatRef.current = setInterval(async () => {
      try {
        const response = await fetch('/api/videos/session/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: deviceIdRef.current }),
        });

        const result = await response.json();
        
        if (!result.success) {
          if (result.error === 'UNAUTHORIZED' || result.error === 'SESSION_REVOKED') {
            toast.error('Session Ended', {
              description: 'Your session has been revoked or expired.',
            });
            router.push('/');
          }
        }

        if (tokenExpiryRef.current) {
          const timeToExpiry = tokenExpiryRef.current.getTime() - Date.now();
          if (timeToExpiry < TOKEN_REFRESH_BUFFER_MS) {
            await fetchPlaybackToken();
          }
        }
      } catch {
        // Heartbeat failed, will retry on next interval
      }
    }, HEARTBEAT_INTERVAL_MS);
  }, [router, toast, fetchPlaybackToken]);

  const handleSignOutOthers = async () => {
    try {
      const response = await fetch('/api/videos/session', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: deviceIdRef.current }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Devices Signed Out', {
          description: `Signed out ${result.signedOutCount} other device(s).`,
        });
        setShowDeviceLimitModal(false);
        await fetchPlaybackToken();
      }
    } catch (err) {
      toast.error('Error', {
        description: 'Failed to sign out other devices',
      });
    }
  };

  useEffect(() => {
    fetchPlaybackToken();
  }, [fetchPlaybackToken]);

  useEffect(() => {
    if (playbackUrl) {
      startHeartbeat();
    }

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [playbackUrl, startHeartbeat]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="text-white">Loading video...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-white p-8">
        <h2 className="text-2xl font-bold mb-4">Unable to Play Video</h2>
        <p className="text-center mb-4">{error.message}</p>
        {error.type === 'NO_ENTITLEMENT' && (
          <Button onClick={() => router.push(`/watch/${videoId}`)}>
            View Purchase Options
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      {(playbackId || playbackUrl) && (
        <MuxPlayer
          playbackId={playbackId || undefined}
          src={playbackUrl || undefined}
          tokens={!playbackUrl && tokens.playback ? {
            playback: tokens.playback,
            thumbnail: tokens.thumbnail || undefined,
          } : undefined}
          streamType="on-demand"
          autoPlay={false}
          {...(adConfig?.hasAds && adConfig.adTagUrl ? {
            advertising: {
              preloadAds: true,
              ima: {
                adTagUrl: adConfig.adTagUrl,
              },
              schedule: buildAdSchedule(adConfig),
            },
          } : {})}
        />
      )}

      <Dialog open={showDeviceLimitModal} onOpenChange={setShowDeviceLimitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Device Limit Reached</DialogTitle>
            <DialogDescription>
              You have reached the maximum number of concurrent devices. Please sign out of other devices to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium mb-2">Active Devices:</p>
            <ul className="space-y-2">
              {otherDevices.map((device, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {device.deviceName || 'Unknown Device'}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeviceLimitModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSignOutOthers}>
              Sign Out Other Devices
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
