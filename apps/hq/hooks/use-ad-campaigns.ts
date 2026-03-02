"use client";

import { useDataFetch } from "./use-data-fetch";

export interface AdCampaign {
  id: string;
  name: string;
  advertiserName: string;
  status: string;
  impressions: string;
  clicks: string;
  budget: string;
  createdAt: string;
}

export interface AdCampaignsFilters {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useAdCampaigns(filters?: AdCampaignsFilters) {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.sortBy) params.set('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);

  const { data, loading, error, refetch, mutate } = useDataFetch<AdCampaign[]>({
    url: `/api/ads/campaigns${params.toString() ? `?${params.toString()}` : ''}`,
  });

  const deleteCampaigns = async (ids: string[]) => {
    const response = await fetch("/api/ads/campaigns", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete campaigns");
    }

    await refetch();
    return true;
  };

  const updateCampaign = async (id: string, data: Partial<AdCampaign>) => {
    const response = await fetch("/api/ads/campaigns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, data }),
    });

    if (!response.ok) {
      throw new Error("Failed to update campaign");
    }

    await refetch();
    return true;
  };

  return {
    campaigns: data || [],
    loading,
    error,
    refetch,
    mutate,
    deleteCampaigns,
    updateCampaign,
  };
}
