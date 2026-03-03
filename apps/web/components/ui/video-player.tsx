"use client";

import * as React from "react";
import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  id?: string;
  src?: string;
  playbackId?: string;
  token?: string;
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
}

export function VideoPlayer({
  id,
  className = "",
  src,
  playbackId: propsPlaybackId,
  token: propsToken,
  metadata,
  debug = false,
  ...videoProps
}: VideoPlayerProps) {
  // Parse playbackId and token from Mux stream URL if present
  let playbackId = propsPlaybackId;
  let token = propsToken;
  
  if (src && !playbackId) {
    const match = src.match(/stream\.mux\.com\/([^.]+)\.m3u8(?:\?token=(.+))?/);
    if (match) {
      playbackId = match[1];
      if (!token && match[2]) token = match[2];
    }
  }

  const envKey = process.env.NEXT_PUBLIC_MUX_ENV_KEY || "";

  return (
    <div className={`relative ${className}`} id={id}>
      {playbackId ? (
        <MuxPlayer
          className="w-full h-full"
          playbackId={playbackId}
          tokens={token ? { playback: token } : undefined}
          envKey={envKey}
          metadata={{
            video_id: metadata.videoId,
            video_title: metadata.videoTitle || "Untitled",
            video_series: metadata.videoSeries,
            player_name: "Kolbo Player",
            viewer_user_id: metadata.viewerUserId,
            experiment_name: metadata.experimentName,
            sub_property_id: metadata.subPropertyId,
          }}
          streamType={metadata.videoStreamType || "on-demand"}
          autoPlay={videoProps.autoPlay}
          muted={videoProps.muted}
          debug={debug}
        />
      ) : src ? (
        <video controls={videoProps.controls !== false} className="w-full h-full" src={src} {...videoProps} />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-black/10 text-white text-sm">
          <p>No video source provided</p>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
