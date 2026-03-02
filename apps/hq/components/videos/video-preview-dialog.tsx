"use client";

import * as React from "react";
import { X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import VideoPlayer from "@/components/ui/video-player";

export interface VideoPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: {
    id: string;
    title: string;
    muxPlaybackId: string | null;
    duration?: number;
  } | null;
}

export function VideoPreviewDialog({ open, onOpenChange, video }: VideoPreviewDialogProps) {
  const [playbackUrl, setPlaybackUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && video?.id) {
      setLoading(true);
      setPlaybackUrl(null);
      
      fetch(`/api/videos/${video.id}/playback-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.playbackUrl) {
            setPlaybackUrl(data.playbackUrl);
          }
        })
        .catch((err) => console.error("Error fetching preview access:", err))
        .finally(() => setLoading(false));
    }
  }, [open, video?.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl font-semibold pr-8">
              {video?.title || "Video Preview"}
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </DialogHeader>
        
        <div className="aspect-video w-full bg-black">
          {playbackUrl ? (
            <VideoPlayer
              id={`preview-${video?.id}`}
              className="w-full h-full"
              src={playbackUrl}
              metadata={{
                videoId: video?.id || "",
                videoTitle: video?.title || "",
                videoDuration: video?.duration || 0,
                videoStreamType: "on-demand",
              }}
            />
          ) : loading || !playbackUrl ? (
            <div className="flex h-full w-full items-center justify-center text-white">
              <div className="text-center space-y-3">
                <Loader2 className="h-10 w-10 animate-spin mx-auto" />
                <p className="text-sm text-white/80">
                  {!video?.muxPlaybackId 
                    ? "Video is being processed..." 
                    : "Loading preview..."}
                </p>
                <p className="text-xs text-white/60">This may take a few moments</p>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
