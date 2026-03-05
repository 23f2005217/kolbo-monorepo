"use client";

import { useDataFetch } from "./use-data-fetch";

export interface Creator {
  id: string;
  displayName: string;
  bio?: string;
  isActive: boolean;
}

export function useCreators() {
  const { data, loading, error, refetch, mutate } = useDataFetch<Creator[]>({
    url: "/api/creators",
  });

  return {
    creators: data || [],
    loading,
    error,
    refetch,
    mutate,
  };
}
