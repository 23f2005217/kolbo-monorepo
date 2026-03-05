'use client';

import { useState, useEffect, useCallback } from 'react';

export interface BrowseVideo {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  subsite?: { id: string; name: string; slug: string } | null;
  category?: { id: string; name: string } | null;
  assets?: Array<{
    id: string;
    muxPlaybackId: string | null;
    durationSeconds: number | null;
  }>;
  customThumbnailUrl?: string;
  muxThumbnailUrl?: string;
  images?: Array<{ imageType: string; storageBucket: string; storagePath: string }>;
}

export function useBrowseVideos(options: {
  subsiteSlug?: string | null;
  search?: string;
  limit?: number;
}) {
  const [videos, setVideos] = useState<BrowseVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('status', 'published');
      if (options.subsiteSlug) params.set('subsiteSlug', options.subsiteSlug);
      if (options.search) params.set('search', options.search);
      if (options.limit) params.set('limit', String(options.limit));

      const res = await fetch(`/api/videos?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch videos');
      const data = await res.json();
      setVideos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [options.subsiteSlug, options.search, options.limit]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return { videos, loading, error, refetch: fetchVideos };
}
