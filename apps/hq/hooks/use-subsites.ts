"use client";

import { useState } from "react";
import { useDataFetch } from "./use-data-fetch";

export interface Subsite {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  category?: string;
  monthlyPrice?: number;
  freeTrialDays?: number;
  thumbnailStorageBucket?: string;
  thumbnailStoragePath?: string;
  iconStorageBucket?: string;
  iconStoragePath?: string;
  config?: any;
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

export function useUpdateSubsite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateSubsite = async (id: string, data: Partial<Subsite>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/subsites/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update channel");
      }

      return await response.json();
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateSubsite, loading, error };
}
