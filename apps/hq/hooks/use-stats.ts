"use client";

import { useDataFetch } from "./use-data-fetch";

export interface Stats {
  videos: {
    total: number;
    published: number;
    unpublished: number;
  };
  liveStreams: {
    total: number;
    live: number;
    scheduled: number;
  };
  playlists: {
    total: number;
  };
  recentVideos: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    assets: Array<{
      durationSeconds?: number;
    }>;
  }>;
}

export function useStats() {
  const { data, loading, error, refetch } = useDataFetch<Stats>({
    url: "/api/stats",
  });

  return {
    stats: data,
    loading,
    error,
    refetch,
  };
}
