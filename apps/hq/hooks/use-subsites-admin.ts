"use client";

import { useDataFetch, useMutation } from "./use-data-fetch";

export interface SubsiteAdmin {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  thumbnailStorageBucket?: string | null;
  thumbnailStoragePath?: string | null;
  thumbnailUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useSubsitesAdmin() {
  const { data, loading, error, refetch } = useDataFetch<SubsiteAdmin[]>({
    url: "/api/subsites?all=true",
  });

  return {
    subsites: data || [],
    loading,
    error,
    refetch,
  };
}

export function useCreateSubsite() {
  const { mutate, loading, error } = useMutation<SubsiteAdmin>("/api/subsites", "POST");
  return { createSubsite: mutate, loading, error };
}

export function useUpdateSubsite() {
  const { mutate, loading, error } = useMutation<SubsiteAdmin>("/api/subsites", "PATCH");

  const updateSubsite = async (id: string, body: Record<string, unknown>) => {
    return mutate(body, `/api/subsites/${id}`);
  };

  return { updateSubsite, loading, error };
}

export function useDeleteSubsite() {
  const { mutate, loading, error } = useMutation("/api/subsites", "DELETE");

  const deleteSubsite = async (id: string) => {
    return mutate(undefined, `/api/subsites/${id}`);
  };

  return { deleteSubsite, loading, error };
}
