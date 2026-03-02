"use client";

import { useDataFetch } from "./use-data-fetch";

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  targetAudience: string;
  scheduledAt?: string;
  sentAt?: string;
  status: "sent" | "scheduled" | "draft";
  createdAt: string;
  updatedAt: string;
}

export function usePushNotifications() {
  const { data, loading, error, refetch } = useDataFetch<PushNotification[]>({
    url: "/api/marketing/push-notifications",
  });

  return {
    notifications: data || [],
    loading,
    error,
    refetch,
  };
}

export function usePushNotification(id: string) {
  const { data, loading, error, refetch } = useDataFetch<PushNotification>({
    url: `/api/marketing/push-notifications/${id}`,
  });

  return {
    notification: data,
    loading,
    error,
    refetch,
  };
}
