"use client";

import { useEffect, useRef } from "react";
import type Mux from "mux-embed";
import type { MuxOptions } from "mux-embed";

type MuxModule = typeof Mux & {
  default?: typeof Mux;
};

declare global {
  interface Window {
    mux: any;
  }
}

interface MuxVideoMetadata {
  player_name?: string;
  player_version?: string;
  player_init_time?: number;

  video_id?: string;
  video_title?: string;
  video_series?: string;
  video_duration?: number;
  video_stream_type?: "live" | "on-demand";
  video_cdn?: string;

  viewer_user_id?: string;
  experiment_name?: string;
  sub_property_id?: string;
}

interface UseMuxMonitorOptions {
  videoId: string;
  metadata: MuxVideoMetadata;
  debug?: boolean;
  disableCookies?: boolean;
  respectDoNotTrack?: boolean;
}

export function useMuxMonitor(options: UseMuxMonitorOptions) {
  const { videoId, metadata, debug = false, disableCookies = false, respectDoNotTrack = false } = options;
  const videoRef = useRef<HTMLVideoElement>(null);
  const muxInitializedRef = useRef(false);
  const destroyedRef = useRef(false);
  const metadataRef = useRef(metadata);
  
  // Keep metadata ref up to date without triggering re-renders
  metadataRef.current = metadata;

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    // Reset destroyed flag when effect runs
    destroyedRef.current = false;

    const loadMuxAndInitialize = async () => {
      if (typeof window === "undefined") return;
      
      // Don't initialize if already destroyed or component unmounting
      if (destroyedRef.current) return;

      try {
        const mux = (await import("mux-embed")) as unknown as MuxModule;
        const muxApi = mux.default || mux;

        // If already initialized, just emit metadata change
        if (muxInitializedRef.current) {
          // @ts-ignore
          if (videoElement.mux && !destroyedRef.current) {
            try {
              muxApi.emit(videoElement, "videochange", {
                video_id: videoId,
                ...metadataRef.current,
              });
            } catch (e) {
              // Emit failed, monitor might be in bad state
              console.warn("Mux emit failed, monitor may need reinitialization");
            }
          }
          return;
        }

        // Check if monitor already exists on this element
        // @ts-ignore
        if (videoElement.mux) {
          console.warn("Mux monitor already exists on video element, skipping initialization");
          muxInitializedRef.current = true;
          return;
        }

        const envKey = process.env.NEXT_PUBLIC_MUX_ENV_KEY || "";

        muxApi.monitor(videoElement, {
          debug,
          disableCookies,
          respectDoNotTrack,
          data: {
            env_key: envKey,
            video_id: videoId,
            player_name: metadataRef.current.player_name || "Kolbo Player",
            player_version: metadataRef.current.player_version || "1.0.0",
            player_init_time: metadataRef.current.player_init_time || Date.now(),
            video_title: metadataRef.current.video_title || "",
            video_series: metadataRef.current.video_series || "",
            video_duration: metadataRef.current.video_duration,
            video_stream_type: metadataRef.current.video_stream_type || "on-demand",
            video_cdn: metadataRef.current.video_cdn || "",
            viewer_user_id: metadataRef.current.viewer_user_id || "",
            experiment_name: metadataRef.current.experiment_name || "",
            sub_property_id: metadataRef.current.sub_property_id || "",
          },
        });

        muxInitializedRef.current = true;
      } catch (error) {
        console.error("Failed to initialize Mux monitoring:", error);
      }
    };

    const initTimeout = setTimeout(loadMuxAndInitialize, 100);

    return () => {
      destroyedRef.current = true;
      clearTimeout(initTimeout);
      // @ts-ignore
      if (videoElement && videoElement.mux) {
        try {
          // @ts-ignore
          if (typeof videoElement.mux.destroy === 'function') {
            // @ts-ignore
            videoElement.mux.destroy();
          }
        } catch (e) {
          // Monitor already destroyed or invalid state - this is expected
        }
      }
      muxInitializedRef.current = false;
    };
  }, [videoId, debug, disableCookies, respectDoNotTrack]); // Removed metadata from deps

  const updateMetadata = (newMetadata: Partial<MuxVideoMetadata>) => {
    const videoElement = videoRef.current;
    // @ts-ignore
    if (videoElement && videoElement.mux) {
      import("mux-embed").then((muxModule: unknown) => {
        const mux = (muxModule as MuxModule).default || (muxModule as MuxModule);
        mux.emit(videoElement, "videochange", {
          video_id: videoId,
          ...newMetadata,
        });
      });
    }
  };

  return { videoRef, updateMetadata };
}
