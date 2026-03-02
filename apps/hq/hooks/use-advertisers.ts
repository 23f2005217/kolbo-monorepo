"use client";

import { useDataFetch } from "./use-data-fetch";

export interface Advertiser {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  status: string;
  campaignsCount: number;
  totalSpend: string;
  createdAt: string;
}

export interface AdvertisersFilters {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useAdvertisers(filters?: AdvertisersFilters) {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.sortBy) params.set('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);

  const { data, loading, error, refetch, mutate } = useDataFetch<Advertiser[]>({
    url: `/api/ads/advertisers${params.toString() ? `?${params.toString()}` : ''}`,
  });

  const deleteAdvertisers = async (ids: string[]) => {
    const response = await fetch("/api/ads/advertisers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete advertisers");
    }

    await refetch();
    return true;
  };

  return {
    advertisers: data || [],
    loading,
    error,
    refetch,
    mutate,
    deleteAdvertisers,
  };
}
