"use client";

import { useDataFetch, useMutation } from "./use-data-fetch";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string | null;
  planType?: string | null;
  tier?: string | null;
  maxDevices?: number | null;
  hasAds: boolean;
  stripeProductId?: string | null;
  stripePriceId?: string | null;
  priceAmount?: number | null; // Price in cents
  priceInterval?: string | null; // month, year, week, day
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useSubscriptionPlans() {
  const { data, loading, error, refetch, mutate } = useDataFetch<SubscriptionPlan[]>({
    url: "/api/subscription-plans",
  });

  return {
    plans: data || [],
    loading,
    error,
    refetch,
    mutate,
  };
}

export function useSubscriptionPlan(id: string) {
  const { data, loading, error, refetch, mutate } = useDataFetch<SubscriptionPlan>({
    url: `/api/subscription-plans/${id}`,
  });

  return {
    plan: data,
    loading,
    error,
    refetch,
    mutate,
  };
}

export function useCreateSubscriptionPlan() {
  const { mutate, loading, error } = useMutation<SubscriptionPlan>("/api/subscription-plans", "POST");
  return { createPlan: mutate, loading, error };
}

export function useUpdateSubscriptionPlan(id: string) {
  const { mutate, loading, error } = useMutation<SubscriptionPlan>(`/api/subscription-plans/${id}`, "PATCH");
  return { updatePlan: mutate, loading, error };
}

export function useDeleteSubscriptionPlan() {
  const { mutate, loading, error } = useMutation("/api/subscription-plans", "DELETE");
  
  const deletePlan = async (id: string) => {
    return mutate(undefined, `/api/subscription-plans/${id}`);
  };
  
  return { deletePlan, loading, error };
}
