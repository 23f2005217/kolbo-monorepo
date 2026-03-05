"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseDataFetchOptions<T> {
  url: string;
  initialData?: T;
  onError?: (error: Error) => void;
  pollInterval?: number; // Poll interval in milliseconds
  shouldPoll?: (data: T | null) => boolean; // Function to determine if polling should continue
}

interface UseDataFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  mutate: (newData: T | null) => void;
}

export function useDataFetch<T>({
  url,
  initialData = null as any,
  onError,
  pollInterval,
  shouldPoll,
}: UseDataFetchOptions<T>): UseDataFetchReturn<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const dataRef = useRef(data);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      dataRef.current = result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [url, onError]);

  useEffect(() => {
    // Reset polling when URL changes
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    fetchData();
  }, [fetchData]);

  // Polling effect - only depends on pollInterval and shouldPoll
  useEffect(() => {
    if (!pollInterval || !shouldPoll) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }

    const setupPolling = async () => {
      // Check if we should continue polling using current data ref
      if (!shouldPoll(dataRef.current)) {
        intervalRef.current = null;
        return;
      }

      // Fetch data directly to avoid dependency issues
      try {
        const response = await fetch(url);
        if (response.ok) {
          const result = await response.json();
          setData(result);
          dataRef.current = result;
        }
      } catch (err) {
        console.error('Polling fetch error:', err);
      }

      // Schedule next poll
      intervalRef.current = setTimeout(setupPolling, pollInterval);
    };

    // Start polling after initial interval
    intervalRef.current = setTimeout(setupPolling, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [pollInterval, shouldPoll, url]);

  const mutate = useCallback((newData: T | null) => {
    setData(newData);
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate,
  };
}

export function useMutation<T = any>(defaultUrl: string, method: string = "POST") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (body?: any, overrideUrl?: string): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const targetUrl = overrideUrl || defaultUrl;
      
      const response = await fetch(targetUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [defaultUrl, method]);

  return { mutate, loading, error };
}
