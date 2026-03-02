"use client";

import { useDataFetch } from "./use-data-fetch";

export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  appliesTo: string;
  expiresAt?: string;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  allowCurrentSubscribers: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useCoupons() {
  const { data, loading, error, refetch } = useDataFetch<Coupon[]>({
    url: "/api/marketing/coupons",
  });

  return {
    coupons: data || [],
    loading,
    error,
    refetch,
  };
}

export function useCoupon(id: string) {
  const { data, loading, error, refetch } = useDataFetch<Coupon>({
    url: `/api/marketing/coupons/${id}`,
  });

  return {
    coupon: data,
    loading,
    error,
    refetch,
  };
}
