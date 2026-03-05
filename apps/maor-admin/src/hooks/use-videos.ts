"use client";

import { useDataFetch, useMutation } from "./use-data-fetch";

export interface Video {
  id: string;
  title: string;
  thumbnailUrl?: string;
  descriptionRich?: string;
  shortDescription?: string;
  status: "published" | "scheduled" | "unpublished" | "archived";
  publishedAt?: string;
  publishScheduledAt?: string;
  slug: string;
  isFree: boolean;
  hasAds: boolean;
  adsMode?: "free_with_ads" | "cheaper_with_ads";
  adsPlacement?: "pre_roll" | "mid_roll";
  midRollIntervalMinutes?: number;
  categoryId?: string;
  subsiteId?: string;
  assets?: Array<{
    id: string;
    muxAssetId?: string;
    muxPlaybackId?: string;
    muxPublicPlaybackId?: string;
    durationSeconds?: number;
    status: string;
  }>;
  category?: {
    id: string;
    name: string;
  };
  subsite?: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  bundles?: Array<{
    bundle: {
      id: string;
      name: string;
    };
  }>;
  searchTags?: Array<{
    searchTag: {
      id: string;
      tag: string;
    };
  }>;
  offers?: Array<{
    id: string;
    offerType: string;
    amountCents?: number;
    rentalDurationDays?: number;
  }>;
  images?: Array<{
    id: string;
    imageType: "horizontal" | "vertical" | "hero";
    storageBucket: string;
    storagePath: string;
  }>;
  creators?: Array<{
    creatorId: string;
    creator: {
      id: string;
      displayName: string;
    };
  }>;
  filterValues?: Array<{
    filterValueId: string;
    filterValue: {
      id: string;
      label: string;
      value: string;
    };
  }>;
  subscriptionPlans?: Array<{
    subscriptionPlanId: string;
    subscriptionPlan: {
      id: string;
      name: string;
    };
  }>;
  trailerVideoId?: string;
}

export function useVideos(filters: { search?: string, status?: string, page?: number, pageSize?: number } = {}) {
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.set("search", filters.search);
  if (filters.status && filters.status !== "all") queryParams.set("status", filters.status);
  if (filters.page) queryParams.set("page", filters.page.toString());
  if (filters.pageSize) queryParams.set("pageSize", filters.pageSize.toString());

  const { data, loading, error, refetch, mutate } = useDataFetch<{ videos: Video[], pagination: { page: number, pageSize: number, total: number, totalPages: number } }>({
    url: `/api/videos${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
  });

  return {
    videos: data?.videos || [],
    pagination: data?.pagination,
    loading,
    error,
    refetch,
    mutate,
  };
}

export function useVideo(id: string) {
   const { data, loading, error, refetch, mutate } = useDataFetch<Video>({
     url: `/api/videos/${id}`,
   });

   return {
     video: data,
     loading,
     error,
     refetch,
     mutate,
   };
}

export function useCreateVideo() {
  const { mutate, loading, error } = useMutation<Video>("/api/videos", "POST");
  return { createVideo: mutate, loading, error };
}

export function useUpdateVideo(id: string) {
  const { mutate, loading, error } = useMutation<Video>(`/api/videos/${id}`, "PATCH");
  return { updateVideo: mutate, loading, error };
}

export function useDeleteVideo() {
  const { mutate, loading, error } = useMutation(`/api/videos`, "DELETE");
  
  const deleteVideo = async (id: string) => {
    return mutate(undefined, `/api/videos/${id}`);
  };
  
  return { deleteVideo, loading, error };
}
