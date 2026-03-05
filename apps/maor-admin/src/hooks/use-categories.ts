"use client";

import { useDataFetch, useMutation } from "./use-data-fetch";

export interface Category {
  id: string;
  name: string;
  type: string;
  description?: string;
  position: number;
  config?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useCategories() {
  const { data, loading, error, refetch, mutate } = useDataFetch<Category[]>({
    url: "/api/categories",
  });

  return {
    categories: data || [],
    loading,
    error,
    refetch,
    mutate,
  };
}

export function useCategory(id: string) {
  const { data, loading, error, refetch, mutate } = useDataFetch<Category>({
    url: `/api/categories/${id}`,
  });

  return {
    category: data,
    loading,
    error,
    refetch,
    mutate,
  };
}

export function useCreateCategory() {
  const { mutate, loading, error } = useMutation<Category>("/api/categories", "POST");
  return { createCategory: mutate, loading, error };
}

export function useUpdateCategory(id: string) {
  const { mutate, loading, error } = useMutation<Category>(`/api/categories/${id}`, "PATCH");
  return { updateCategory: mutate, loading, error };
}

export function useUpdateCategoryGeneric() {
  const { mutate, loading, error } = useMutation<Category>("/api/categories", "PATCH");
  
  const updateCategory = async ({ id, ...data }: { id: string } & Partial<Category>) => {
    return mutate(data, `/api/categories/${id}`);
  };

  return { updateCategory, loading, error };
}

export function useDeleteCategory() {
  const { mutate, loading, error } = useMutation("/api/categories", "DELETE");
  
  const deleteCategory = async (id: string) => {
    return mutate(undefined, `/api/categories/${id}`);
  };
  
  return { deleteCategory, loading, error };
}
