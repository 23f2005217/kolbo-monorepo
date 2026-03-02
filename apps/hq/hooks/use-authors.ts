"use client";

import { useDataFetch, useMutation } from "./use-data-fetch";
import { Author, AuthorFormData, RevShareAgreement, RevShareAgreementFormData } from "@/stores/authors-store";

export type { Author, AuthorFormData, RevShareAgreement, RevShareAgreementFormData };

export function useAuthors() {
  const { data, loading, error, refetch, mutate } = useDataFetch<Author[]>({
    url: "/api/artists",
  });

  return {
    authors: data || [],
    loading,
    error,
    refetch,
    mutate,
  };
}

export function useAuthor(id: string) {
  const { data, loading, error, refetch, mutate } = useDataFetch<Author>({
    url: `/api/artists/${id}`,
  });

  return {
    author: data,
    loading,
    error,
    refetch,
    mutate,
  };
}

export function useCreateAuthor() {
  const { mutate, loading, error } = useMutation<Author>("/api/artists", "POST");
  return { createAuthor: mutate, loading, error };
}

export function useUpdateAuthor(id: string) {
  const { mutate, loading, error } = useMutation<Author>(`/api/artists/${id}`, "PATCH");
  return { updateAuthor: mutate, loading, error };
}

export function useUpdateAuthorGeneric() {
  const { mutate, loading, error } = useMutation<Author>("/api/artists", "PATCH");
  
  const updateAuthor = async ({ id, ...data }: { id: string } & Partial<AuthorFormData>) => {
    return mutate(data, `/api/artists/${id}`);
  };

  return { updateAuthor, loading, error };
}

export function useDeleteAuthor() {
  const { mutate, loading, error } = useMutation("/api/artists", "DELETE");
  
  const deleteAuthor = async (id: string) => {
    return mutate(undefined, `/api/artists/${id}`);
  };
  
  return { deleteAuthor, loading, error };
}

export function useRevShareAgreements() {
  const { data, loading, error, refetch, mutate } = useDataFetch<RevShareAgreement[]>({
    url: "/api/revshare-agreements",
  });

  return {
    agreements: data || [],
    loading,
    error,
    refetch,
    mutate,
  };
}

export function useRevShareAgreement(id: string) {
  const { data, loading, error, refetch, mutate } = useDataFetch<RevShareAgreement>({
    url: `/api/revshare-agreements/${id}`,
  });

  return {
    agreement: data,
    loading,
    error,
    refetch,
    mutate,
  };
}

export function useCreateRevShareAgreement() {
  const { mutate, loading, error } = useMutation<RevShareAgreement>("/api/revshare-agreements", "POST");
  return { createAgreement: mutate, loading, error };
}

export function useUpdateRevShareAgreement(id: string) {
  const { mutate, loading, error } = useMutation<RevShareAgreement>(`/api/revshare-agreements/${id}`, "PATCH");
  return { updateAgreement: mutate, loading, error };
}

export function useUpdateRevShareAgreementGeneric() {
  const { mutate, loading, error } = useMutation<RevShareAgreement>("/api/revshare-agreements", "PATCH");
  
  const updateAgreement = async ({ id, ...data }: { id: string } & Partial<RevShareAgreementFormData>) => {
    return mutate(data, `/api/revshare-agreements/${id}`);
  };

  return { updateAgreement, loading, error };
}

export function useDeleteRevShareAgreement() {
  const { mutate, loading, error } = useMutation("/api/revshare-agreements", "DELETE");
  
  const deleteAgreement = async (id: string) => {
    return mutate(undefined, `/api/revshare-agreements/${id}`);
  };
  
  return { deleteAgreement, loading, error };
}
