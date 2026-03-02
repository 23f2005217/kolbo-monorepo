"use client";

import { useDataFetch } from "./use-data-fetch";

export interface AdMetric {
  label: string;
  value: string;
  subtext: string;
}

export interface AdPerformanceRow {
  id: string;
  name: string;
  subtitle: string;
  status: string;
  duration: string;
  daysRan: number;
  impressions: string;
  clicks: string;
  ctr: string;
  spend: string;
  cpm: string;
  cpc: string;
  conversions: string;
  convRate: string;
}

export interface AdAnalyticsData {
  metrics: AdMetric[];
  performance: AdPerformanceRow[];
}

export interface AdAnalyticsFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useAdAnalytics(filters?: AdAnalyticsFilters) {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.set('dateTo', filters.dateTo);

  const { data, loading, error, refetch } = useDataFetch<AdAnalyticsData>({
    url: `/api/ads/analytics${params.toString() ? `?${params.toString()}` : ''}`,
  });

  return {
    analytics: data,
    loading,
    error,
    refetch,
  };
}
