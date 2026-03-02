"use client";

import * as React from "react";
import { useMuxMonitor } from "@/hooks/use-mux-monitor";

interface VideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  id?: string;
  metadata: {
    videoId: string;
    videoTitle?: string;
    videoSeries?: string;
    videoDuration?: number;
    videoStreamType?: "live" | "on-demand";
    videoCdn?: string;
    viewerUserId?: string;
    experimentName?: string;
    subPropertyId?: string;
  };
  debug?: boolean;
  onMetadataUpdate?: (metadata: any) => void;
}

export function VideoPlayer({
  children,
  metadata,
  debug = false,
  onMetadataUpdate,
  className = "",
  ...videoProps
}: VideoPlayerProps) {
  // Memoize metadata to prevent unnecessary re-renders
  const memoizedMetadata = React.useMemo(() => ({
    video_id: metadata.videoId,
    video_title: metadata.videoTitle,
    video_series: metadata.videoSeries,
    video_duration: metadata.videoDuration,
    video_stream_type: metadata.videoStreamType,
    video_cdn: metadata.videoCdn,
    viewer_user_id: metadata.viewerUserId,
    experiment_name: metadata.experimentName,
    sub_property_id: metadata.subPropertyId,
  }), [
    metadata.videoId,
    metadata.videoTitle,
    metadata.videoSeries,
    metadata.videoDuration,
    metadata.videoStreamType,
    metadata.videoCdn,
    metadata.viewerUserId,
    metadata.experimentName,
    metadata.subPropertyId,
  ]);

  const { videoRef, updateMetadata } = useMuxMonitor({
    videoId: metadata.videoId,
    metadata: memoizedMetadata,
    debug,
  });

  React.useEffect(() => {
    if (onMetadataUpdate) {
      onMetadataUpdate({
        video_id: metadata.videoId,
        video_title: metadata.videoTitle,
        video_series: metadata.videoSeries,
        video_duration: metadata.videoDuration,
        video_stream_type: metadata.videoStreamType,
        video_cdn: metadata.videoCdn,
        viewer_user_id: metadata.viewerUserId,
        experiment_name: metadata.experimentName,
        sub_property_id: metadata.subPropertyId,
      });
    }
  }, [metadata, onMetadataUpdate]);

  React.useImperativeHandle(onMetadataUpdate, () => ({
    updateMetadata,
  }));

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        controls
        className="w-full h-full"
        {...videoProps}
      >
        {children}
      </video>
    </div>
  );
}

export default VideoPlayer;
