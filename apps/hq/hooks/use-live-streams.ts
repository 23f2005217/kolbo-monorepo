"use client";

import { useDataFetch, useMutation } from "./use-data-fetch";

export interface LiveStream {
  id: string;
  title: string;
  descriptionRich?: string;
  shortDescription?: string;
  status: "published" | "scheduled" | "unpublished" | "archived";
  scheduledStartAt?: string;
  muxPlaybackId?: string;
  muxLiveStreamId?: string;
  muxStreamKey?: string;
  muxRtmpUrl?: string;
  sourceType?: "mux_rtmp" | "browser" | "zoom";
  chatEnabled: boolean;
  remindersEnabled: boolean;
  donationsEnabled: boolean;
  rewindEnabled: boolean;
  isFree: boolean;
  preregEnabled: boolean;
  zoomUrl?: string;
  thumbnailStorageBucket?: string;
  thumbnailStoragePath?: string;
  categoryId?: string;
  category?: any;
  createdAt: string;
  updatedAt: string;
}

export function useLiveStreams(filters: { 
  search?: string; 
  status?: string; 
  sortBy?: string; 
  sortOrder?: 'asc' | 'desc'; 
} = {}) {
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.set('search', filters.search);
  if (filters.status) queryParams.set('status', filters.status);
  if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);
  if (filters.sortOrder) queryParams.set('sortOrder', filters.sortOrder);

  const { data, loading, error, refetch, mutate } = useDataFetch<LiveStream[]>({
    url: `/api/live-streams?${queryParams.toString()}`,
  });

  return {
    liveStreams: data || [],
    loading,
    error,
    refetch,
    mutate,
  };
}

export function useLiveStream(id: string) {
  const { data, loading, error, refetch, mutate } = useDataFetch<LiveStream>({
    url: `/api/live-streams/${id}`,
  });

  return {
    liveStream: data,
    loading,
    error,
    refetch,
    mutate,
  };
}

export function useCreateLiveStream() {
  const { mutate, loading, error } = useMutation<LiveStream>("/api/live-streams", "POST");
  return { createLiveStream: mutate, loading, error };
}

export function useUpdateLiveStream(id: string) {
  const { mutate, loading, error } = useMutation<LiveStream>(`/api/live-streams/${id}`, "PATCH");
  return { updateLiveStream: mutate, loading, error };
}

export function useDeleteLiveStream() {
  const { mutate, loading, error } = useMutation("/api/live-streams", "DELETE");
  
  const deleteLiveStream = async (id: string) => {
    return mutate({ ids: [id] });
  };
  
  const deleteLiveStreams = async (ids: string[]) => {
    return mutate({ ids });
  };
  
  return { deleteLiveStream, deleteLiveStreams, loading, error };
}
