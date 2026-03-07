"use client";

import { useState, useEffect } from "react";

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
  images?: Array<{
    imageType: string;
    storageBucket: string;
    storagePath: string;
  }>;
}

export function useBrowseVideos({
  subsiteSlug,
  search,
  limit = 10,
}: {
  subsiteSlug?: string;
  search?: string;
  limit?: number;
}) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [offset, setOffset] = useState(0);

  const fetchVideos = async (append = false, currentOffset = offset) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        status: "published",
        offset: String(currentOffset),
        limit: String(limit),
      });

      if (subsiteSlug) params.set("subsiteSlug", subsiteSlug);
      if (search) params.set("search", search);

      const res = await fetch(`/api/videos?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();

      setVideos((prev) => (append ? [...prev, ...data] : data));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    setInitialLoading(true);
    fetchVideos(false, 0);
  }, [subsiteSlug, search, limit]);

  const loadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchVideos(true, newOffset);
  };

  return {
    videos,
    loading,
    initialLoading,
    error,
    loadMore,
  };
}
