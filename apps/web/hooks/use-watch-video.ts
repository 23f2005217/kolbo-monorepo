'use client';

import { useState, useEffect, useCallback } from 'react';

export interface WatchVideo {
  id: string;
  title: string;
  shortDescription?: string | null;
  descriptionRich?: string | null;
  isFree: boolean;
  hasAds: boolean;
  maxSimultaneousStreams?: number | null;
  subsite?: { id: string; name: string; slug: string } | null;
  category?: { id: string; name: string } | null;
  assets?: Array<{
    id: string;
    muxPlaybackId: string | null;        // Signed - for video playback
    muxPublicPlaybackId: string | null;  // Public - for thumbnails
    durationSeconds: number | null;
  }>;
  offers?: Array<{
    id: string;
    offerType: string;
    amountCents: number;
    pricePerDeviceCents?: number | null;
    rentalDurationDays?: number | null;
    tierLabel?: string | null;
    maxSimultaneousStreams?: number | null;
    currency: string;
  }>;
  subscriptionPlans?: Array<{ subscriptionPlanId: string }>;
  images?: Array<{ imageType: string; storageBucket: string; storagePath: string }>;
  customThumbnailUrl?: string;
}

export type GatingType = 'free' | 'free_with_ads' | 'subscription_only' | 'rental_or_purchase';

export function computeGatingType(video: WatchVideo | null): GatingType {
  if (!video) return 'rental_or_purchase';
  if (video.isFree && !video.hasAds) return 'free';
  if (video.isFree && video.hasAds) return 'free_with_ads';
  const hasSubOffer = video.offers?.some((o) => o.offerType === 'subscription_access');
  const hasSubPlan = (video.subscriptionPlans?.length ?? 0) > 0;
  const hasRentalOrPurchase = video.offers?.some((o) => o.offerType === 'rental' || o.offerType === 'purchase');
  if ((hasSubOffer || hasSubPlan) && !hasRentalOrPurchase) return 'subscription_only';
  return 'rental_or_purchase';
}

export function useWatchVideo(id: string | null) {
  const [video, setVideo] = useState<WatchVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideo = useCallback(async () => {
    if (!id) {
      setVideo(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/videos/${id}`);
      if (!res.ok) {
        if (res.status === 404) setVideo(null);
        else throw new Error('Failed to fetch video');
        return;
      }
      const data = await res.json();
      setVideo(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setVideo(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVideo();
  }, [fetchVideo]);

  const gatingType = computeGatingType(video);
  const rentalOffers = video?.offers?.filter((o) => o.offerType === 'rental') ?? [];
  const purchaseOffers = video?.offers?.filter((o) => o.offerType === 'purchase') ?? [];
  const purchaseOffer = purchaseOffers[0]; // For legacy compatibility or single-tier fetch

  return {
    video,
    loading,
    error,
    refetch: fetchVideo,
    gatingType,
    rentalOffers,
    purchaseOffers,
    purchaseOffer,
  };
}
