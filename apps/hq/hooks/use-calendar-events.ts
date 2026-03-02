"use client";

import { useDataFetch, useMutation } from "./use-data-fetch";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventType: "video" | "live" | "promotion" | "playlist";
  scheduledAt: string;
  status: "scheduled" | "draft" | "completed";
  createdAt: string;
  updatedAt: string;
}

export function useCalendarEvents() {
  const { data, loading, error, refetch } = useDataFetch<CalendarEvent[]>({
    url: "/api/calendar/events",
  });

  return {
    events: data || [],
    loading,
    error,
    refetch,
  };
}

export function useCalendarEvent(id: string) {
  const { data, loading, error, refetch } = useDataFetch<CalendarEvent>({
    url: `/api/calendar/events/${id}`,
  });

  return {
    event: data,
    loading,
    error,
    refetch,
  };
}

export function useCreateCalendarEvent() {
  const { mutate, loading, error } = useMutation<CalendarEvent>("/api/calendar/events", "POST");
  return { createCalendarEvent: mutate, loading, error };
}

export function useDeleteCalendarEvent() {
  const { mutate, loading, error } = useMutation("/api/calendar/events", "DELETE");
  
  const deleteCalendarEvent = async (id: string) => {
    return mutate(undefined, `/api/calendar/events/${id}`);
  };
  
  return { deleteCalendarEvent, loading, error };
}
