"use client";

import { useDataFetch } from "./use-data-fetch";

export interface UpsellOffer {
  id: string;
  name: string;
  trigger: string;
  discount: number;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useUpsellOffers() {
  const { data, loading, error, refetch } = useDataFetch<UpsellOffer[]>({
    url: "/api/marketing/upsell-offers",
  });

  return {
    upsells: data || [],
    loading,
    error,
    refetch,
  };
}

export function useUpsellOffer(id: string) {
  const { data, loading, error, refetch } = useDataFetch<UpsellOffer>({
    url: `/api/marketing/upsell-offers/${id}`,
  });

  return {
    upsell: data,
    loading,
    error,
    refetch,
  };
}
