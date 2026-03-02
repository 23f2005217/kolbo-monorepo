"use client";

import { useDataFetch, useMutation } from "./use-data-fetch";
import { Filter, FilterFormData, FilterValueFormData, FilterValue } from "@/stores/filters-store";

export type { Filter, FilterFormData, FilterValueFormData, FilterValue };

export function useFilters() {
  const { data, loading, error, refetch, mutate } = useDataFetch<Filter[]>({
    url: "/api/filters",
  });

  return {
    filters: data || [],
    loading,
    error,
    refetch,
    mutate,
  };
}

export function useFilter(id: string) {
  const { data, loading, error, refetch, mutate } = useDataFetch<Filter>({
    url: `/api/filters/${id}`,
  });

  return {
    filter: data,
    loading,
    error,
    refetch,
    mutate,
  };
}

export function useCreateFilter() {
  const { mutate, loading, error } = useMutation<Filter>("/api/filters", "POST");
  return { createFilter: mutate, loading, error };
}

export function useUpdateFilter(id: string) {
  const { mutate, loading, error } = useMutation<Filter>(`/api/filters/${id}`, "PATCH");
  return { updateFilter: mutate, loading, error };
}

export function useUpdateFilterGeneric() {
  const { mutate, loading, error } = useMutation<Filter>("/api/filters", "PATCH");
  
  const updateFilter = async ({ id, ...data }: { id: string } & Partial<FilterFormData>) => {
    return mutate(data, `/api/filters/${id}`);
  };

  return { updateFilter, loading, error };
}

export function useDeleteFilter() {
  const { mutate, loading, error } = useMutation("/api/filters", "DELETE");
  
  const deleteFilter = async (id: string) => {
    return mutate(undefined, `/api/filters/${id}`);
  };
  
  return { deleteFilter, loading, error };
}

export function useCreateFilterValue() {
  const { mutate, loading, error } = useMutation<any>("/api/filter-values", "POST");
  return { createFilterValue: mutate, loading, error };
}

export function useUpdateFilterValue() {
  const { mutate, loading, error } = useMutation<any>("/api/filter-values", "PATCH");
  
  const updateFilterValue = async ({ id, ...data }: { id: string } & Partial<FilterValueFormData>) => {
    return mutate(data, `/api/filter-values/${id}`);
  };

  return { updateFilterValue, loading, error };
}

export function useDeleteFilterValue() {
  const { mutate, loading, error } = useMutation("/api/filter-values", "DELETE");
  
  const deleteFilterValue = async (id: string) => {
    return mutate(undefined, `/api/filter-values/${id}`);
  };
  
  return { deleteFilterValue, loading, error };
}
