"use client";

import { useDataFetch } from "./use-data-fetch";

// ==================== ARTIST HOOKS ====================
export function useArtists() {
  return useDataFetch<any[]>({ url: "/api/artists" });
}

export function useArtist(id?: string) {
  return useDataFetch<any>({ url: id ? `/api/artists/${id}` : "" });
}

// ==================== REVENUE SHARE AGREEMENT HOOKS ====================
export function useRevShareAgreements() {
  return useDataFetch<any[]>({ url: "/api/revshare-agreements" });
}

export function useRevShareAgreement(id?: string) {
  return useDataFetch<any>({ url: id ? `/api/revshare-agreements/${id}` : "" });
}
