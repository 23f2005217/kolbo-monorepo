"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Radio, Video, Users, ChevronRight, Monitor, Camera, X } from "lucide-react";
import { useCreateLiveStream } from "@/hooks/use-live-streams";
import { cn } from "@/utils";

type StreamType = "studio" | "rtmp" | "zoom";

interface CreateStreamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateStreamDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateStreamDialogProps) {
  const router = useRouter();
  const { createLiveStream, loading } = useCreateLiveStream();

  const handleSelect = async (type: StreamType) => {
    const streamData = {
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Live Stream ${Math.floor(10000 + Math.random() * 90000)}`,
      status: "unpublished",
      sourceType: type === "studio" ? "browser" : type === "zoom" ? "zoom" : "mux_rtmp",
      chatEnabled: true,
      remindersEnabled: true,
      isFree: true,
    };

    try {
      const newStream = await createLiveStream(streamData);
      if (newStream && newStream.id) {
        onOpenChange(false);
        router.push(`/content/live/${newStream.id}`);
      }
    } catch (error) {
      console.error("Failed to create stream:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border-none bg-transparent shadow-none">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-8 py-6 border-b">
            <h2 className="text-xl font-semibold text-[#1a1c21]">Choose your Live Event type</h2>
          </div>

          <div className="p-8 space-y-4">
            {/* Live Studio */}
            <div 
              className="group flex items-center justify-between p-6 rounded-xl border border-gray-100 bg-[#f9fafb] hover:bg-white hover:border-blue-100 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleSelect("studio")}
            >
              <div className="flex items-center gap-6">
                <div className="h-12 w-12 rounded-lg bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                  <Camera className="h-6 w-6 text-gray-700" />
                </div>
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[#1a1c21]">Live Studio</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      Best for new streamers
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground italic">Stream directly from your browser with your webcam.</p>
                </div>
              </div>
              <Button variant="link" className="text-blue-600 font-medium hover:no-underline px-0">Select</Button>
            </div>

            {/* Stream software */}
            <div 
              className="group flex items-center justify-between p-6 rounded-xl border border-gray-100 bg-[#f9fafb] hover:bg-white hover:border-blue-100 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleSelect("rtmp")}
            >
              <div className="flex items-center gap-6">
                <div className="h-12 w-12 rounded-lg bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                  <Monitor className="h-6 w-6 text-gray-700" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[#1a1c21]">Stream software | RTMP</span>
                  </div>
                  <p className="text-sm text-muted-foreground italic">Add overlays, new graphics and more by connecting a 3rd party tool.</p>
                </div>
              </div>
              <Button variant="link" className="text-blue-600 font-medium hover:no-underline px-0">Select</Button>
            </div>

            {/* Zoom */}
            <div 
              className="group flex items-center justify-between p-6 rounded-xl border border-gray-100 bg-[#f9fafb] hover:bg-white hover:border-blue-100 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleSelect("zoom")}
            >
              <div className="flex items-center gap-6">
                <div className="h-12 w-12 rounded-lg bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                  <Users className="h-6 w-6 text-gray-700" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[#1a1c21]">Zoom</span>
                  </div>
                  <p className="text-sm text-muted-foreground italic">Interact with your members during the stream by streaming with Zoom meetings.</p>
                </div>
              </div>
              <Button variant="link" className="text-blue-600 font-medium hover:no-underline px-0">Select</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
