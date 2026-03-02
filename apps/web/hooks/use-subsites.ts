"use client";

import { useDataFetch } from "./use-data-fetch";

export interface Subsite {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export function useSubsites() {
  const { data, loading, error, refetch, mutate } = useDataFetch<Subsite[]>({
    url: "/api/subsites",
  });

  return {
    subsites: data || [],
    loading,
    error,
    refetch,
    mutate,
  };
}
