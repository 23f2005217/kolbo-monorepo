"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ExternalLink, Radio } from "lucide-react";
import { cn } from "@/utils";

interface StreamDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streamData: {
    id: string;
    title: string;
    streamKey?: string;
    rtmpUrl?: string;
    srtUrl?: string;
    srtPassphrase?: string;
    playbackId?: string;
    status?: string;
  } | null;
}

export function StreamDetailsDialog({
  open,
  onOpenChange,
  streamData,
}: StreamDetailsDialogProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!streamData) return null;

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, field)}
      className="h-8"
    >
      {copiedField === field ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            {streamData.title}
          </DialogTitle>
          <DialogDescription>
            Stream configuration and connection details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {streamData.status && (
            <div>
              <Badge
                variant="outline"
                className={cn(
                  streamData.status === "active" && "bg-green-500/10 text-green-700",
                  streamData.status === "idle" && "bg-gray-500/10 text-gray-700"
                )}
              >
                {streamData.status}
              </Badge>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">RTMP Configuration</h3>
            
            <div className="space-y-3 rounded-lg border p-4 bg-muted/50">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Stream URL
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 rounded bg-background px-3 py-2 text-sm font-mono">
                    {streamData.rtmpUrl || "rtmps://global-live.mux.com:443/app"}
                  </code>
                  <CopyButton
                    text={streamData.rtmpUrl || "rtmps://global-live.mux.com:443/app"}
                    field="rtmp-url"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Stream Key
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 rounded bg-background px-3 py-2 text-sm font-mono">
                    {streamData.streamKey || "••••••••••••••••"}
                  </code>
                  {streamData.streamKey && (
                    <CopyButton text={streamData.streamKey} field="stream-key" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">SRT Configuration</h3>
            <p className="text-sm text-muted-foreground">
              SRT provides better quality over unreliable networks and supports lower latency
            </p>

            <div className="space-y-3 rounded-lg border p-4 bg-muted/50">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  SRT URL
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 rounded bg-background px-3 py-2 text-sm font-mono break-all">
                    {streamData.srtUrl || `srt://global-live.mux.com:6001?streamid=${streamData.streamKey || "YOUR_STREAM_KEY"}&passphrase=YOUR_PASSPHRASE`}
                  </code>
                  {streamData.srtUrl && (
                    <CopyButton text={streamData.srtUrl} field="srt-url" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Stream ID
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 rounded bg-background px-3 py-2 text-sm font-mono">
                      {streamData.streamKey || "••••••••••••••••"}
                    </code>
                    {streamData.streamKey && (
                      <CopyButton text={streamData.streamKey} field="srt-streamid" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Passphrase
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 rounded bg-background px-3 py-2 text-sm font-mono">
                      {streamData.srtPassphrase || "••••••••••••••••"}
                    </code>
                    {streamData.srtPassphrase && (
                      <CopyButton text={streamData.srtPassphrase} field="srt-passphrase" />
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-2 text-sm text-muted-foreground">
                <p className="font-medium">Common SRT Settings:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Mode: <code className="text-xs bg-background px-1 py-0.5 rounded">caller</code></li>
                  <li>Latency: <code className="text-xs bg-background px-1 py-0.5 rounded">500ms</code> (recommended)</li>
                  <li>Encryption: <code className="text-xs bg-background px-1 py-0.5 rounded">AES-128</code></li>
                  <li>Overhead: <code className="text-xs bg-background px-1 py-0.5 rounded">25%</code></li>
                </ul>
              </div>
            </div>
          </div>

          {streamData.playbackId && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Playback</h3>
              
              <div className="space-y-3 rounded-lg border p-4 bg-muted/50">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Playback ID
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 rounded bg-background px-3 py-2 text-sm font-mono">
                      {streamData.playbackId}
                    </code>
                    <CopyButton text={streamData.playbackId} field="playback-id" />
                  </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <a
                    href={`https://stream.mux.com/${streamData.playbackId}.m3u8`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Test Player
                  </a>
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-lg border p-4 bg-blue-500/10 border-blue-500/20">
            <h4 className="font-medium text-sm mb-2">Encoder Configuration</h4>
            <p className="text-sm text-muted-foreground">
              Use these settings in OBS, Wirecast, vMix, or other streaming software. 
              For SRT, select "SRT Caller" mode and use the SRT URL or enter the stream ID and passphrase separately.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
