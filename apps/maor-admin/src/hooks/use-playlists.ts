"use client";

import { useDataFetch, useMutation } from "./use-data-fetch";

export interface Playlist {
  id: string;
  title: string;
  descriptionRich?: string;
  shortDescription?: string;
  status: "published" | "scheduled" | "unpublished" | "archived";
  publishScheduledAt?: string;
  position: number;
  category?: {
    id: string;
    name: string;
  };
  items?: Array<{
    id: string;
    videoId: string;
    position: number;
  }>;
  thumbnailUrl?: string;
  thumbnailStorageBucket?: string;
  thumbnailStoragePath?: string;
  trailerVideoId?: string;
  isFree?: boolean;
  createdAt: string;
  updatedAt: string;
}

export function usePlaylists() {
  const { data, loading, error, refetch, mutate } = useDataFetch<Playlist[]>({
    url: "/api/playlists",
  });

  return {
    playlists: data || [],
    loading,
    error,
    refetch,
    mutate,
  };
}

export function usePlaylist(id: string) {
  const { data, loading, error, refetch, mutate } = useDataFetch<Playlist>({
    url: `/api/playlists/${id}`,
  });

  return {
    playlist: data,
    loading,
    error,
    refetch,
    mutate,
  };
}

export function useCreatePlaylist() {
  const { mutate, loading, error } = useMutation<Playlist>("/api/playlists", "POST");
  return { createPlaylist: mutate, loading, error };
}

export function useUpdatePlaylist(id: string) {
  const { mutate, loading, error } = useMutation<Playlist>(`/api/playlists/${id}`, "PATCH");
  return { updatePlaylist: mutate, loading, error };
}

export function useDeletePlaylist() {
  const { mutate, loading, error } = useMutation("/api/playlists", "DELETE");
  
  const deletePlaylist = async (id: string) => {
    return mutate(undefined, `/api/playlists/${id}`);
  };
  
  return { deletePlaylist, loading, error };
}
