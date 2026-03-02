"use client";

import { useState } from "react";
import { useDataFetch } from "./use-data-fetch";

export interface AdCreative {
  id: string;
  name: string;
  status: string;
  storageBucket: string;
  storagePath: string;
  createdAt: string;
  url?: string;
  advertiserId: string;
  advertiser?: {
    companyName: string;
  };
  campaignId?: string;
  campaign?: {
    name: string;
  };
}

export interface AdCreativesFilters {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useAdCreatives(filters?: AdCreativesFilters) {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.sortBy) params.set('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);

  const { data, loading, error, refetch, mutate } = useDataFetch<AdCreative[]>({
    url: `/api/ads/creatives${params.toString() ? `?${params.toString()}` : ''}`,
  });

  const deleteCreatives = async (ids: string[]) => {
    const response = await fetch("/api/ads/creatives", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete creatives");
    }

    await refetch();
    return true;
  };

  return {
    creatives: data || [],
    loading,
    error,
    refetch,
    mutate,
    deleteCreatives,
  };
}
