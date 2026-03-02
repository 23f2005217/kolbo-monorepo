"use client";

import { useDataFetch } from "./use-data-fetch";

export interface Bundle {
  id: string;
  name: string;
  description?: string;
  price?: number;
}

export function useBundles() {
  const { data, loading, error, refetch } = useDataFetch<Bundle[]>({
    url: "/api/bundles",
  });

  return {
    bundles: data || [],
    loading,
    error,
    refetch,
  };
}
