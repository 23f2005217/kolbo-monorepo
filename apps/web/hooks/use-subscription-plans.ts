"use client";

import { useDataFetch, useMutation } from "./use-data-fetch";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  stripeProductId?: string;
  stripePriceId?: string;
  priceAmount?: number; // Price in cents
  priceInterval?: string; // month, year, week, day
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
