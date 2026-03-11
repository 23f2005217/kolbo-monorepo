"use client";

import { useDataFetch, useMutation } from "./use-data-fetch";

export interface BundleSubsite {
  id: string;
  bundleId: string;
  subsiteId: string;
  subsite: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    monthlyPrice?: number | null;
    thumbnailStorageBucket?: string | null;
    thumbnailStoragePath?: string | null;
    isActive: boolean;
  };
}

export interface Bundle {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null; // in cents
  originalPrice?: number | null;
  discountPercent?: number | null;
  stripeProductId?: string | null;
  stripePriceId?: string | null;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bundleSubsites: BundleSubsite[];
}

export function useBundles() {
  const { data, loading, error, refetch, mutate } = useDataFetch<Bundle[]>({
    url: "/api/bundles",
  });

  return {
    bundles: data || [],
    loading,
    error,
    refetch,
    mutate,
  };
}

export function useBundle(id: string) {
  const { data, loading, error, refetch, mutate } = useDataFetch<Bundle>({
    url: `/api/bundles/${id}`,
  });

  return {
    bundle: data,
    loading,
    error,
    refetch,
    mutate,
  };
}

export function useCreateBundle() {
  const { mutate, loading, error } = useMutation<Bundle>("/api/bundles", "POST");
  return { createBundle: mutate, loading, error };
}

export function useUpdateBundle(id: string) {
  const { mutate, loading, error } = useMutation<Bundle>(`/api/bundles/${id}`, "PATCH");
  return { updateBundle: mutate, loading, error };
}

export function useDeleteBundle() {
  const { mutate, loading, error } = useMutation("/api/bundles", "DELETE");

  const deleteBundle = async (id: string) => {
    return mutate(undefined, `/api/bundles/${id}`);
  };

  return { deleteBundle, loading, error };
}
