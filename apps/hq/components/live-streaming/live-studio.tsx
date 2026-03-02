"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Radio, 
  Video as VideoIcon, 
  Mic, 
  MicOff, 
  VideoOff, 
  Settings,
  X,
  Loader2,
  Monitor,
  MonitorOff
} from "lucide-react";
import { cn } from "@/utils";

interface LiveStudioProps {
  streamKey?: string;
  onClose?: () => void;
}

export function LiveStudio({ streamKey, onClose }: LiveStudioProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [isCameraOn, setIsCameraOn] = React.useState(false);
  const [isMicOn, setIsMicOn] = React.useState(false);
  const [isScreenSharing, setIsScreenSharing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const updateStream = (newStream: MediaStream) => {
    setStream(newStream);
    if (videoRef.current) {
      videoRef.current.srcObject = newStream;
    }
  };

  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: "user"
        }
      });

      if (stream) {
        // Remove existing video tracks
        stream.getVideoTracks().forEach(track => {
          track.stop();
          stream.removeTrack(track);
        });
        mediaStream.getVideoTracks().forEach(track => stream.addTrack(track));
        updateStream(new MediaStream(stream.getTracks()));
      } else {
        updateStream(mediaStream);
      }
      setIsCameraOn(true);
      setIsScreenSharing(false);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setError("Could not access camera. It might be in use or not connected.");
    }
  };

  const startMic = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (stream) {
        stream.getAudioTracks().forEach(track => {
          track.stop();
          stream.removeTrack(track);
        });
        mediaStream.getAudioTracks().forEach(track => stream.addTrack(track));
        updateStream(new MediaStream(stream.getTracks()));
      } else {
        updateStream(mediaStream);
      }
      setIsMicOn(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError("Could not access microphone.");
    }
  };

  const startScreenShare = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      
      if (stream) {
        stream.getVideoTracks().forEach(track => {
          track.stop();
          stream.removeTrack(track);
        });
        mediaStream.getVideoTracks().forEach(track => stream.addTrack(track));
        // Add screen audio if available
        mediaStream.getAudioTracks().forEach(track => stream.addTrack(track));
        updateStream(new MediaStream(stream.getTracks()));
      } else {
        updateStream(mediaStream);
      }
      
      setIsScreenSharing(true);
      setIsCameraOn(false);

      // Handle user stopping screen share from browser UI
      mediaStream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
      };

    } catch (error) {
      console.error("Error accessing screen share:", error);
      setError("Screen sharing was cancelled or failed.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.stop();
        stream.removeTrack(track);
      });
      setIsCameraOn(false);
      updateStream(new MediaStream(stream.getTracks()));
    }
  };

  const stopMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.stop();
        stream.removeTrack(track);
      });
      setIsMicOn(false);
      updateStream(new MediaStream(stream.getTracks()));
    }
  };

  const stopScreenShare = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.stop();
        stream.removeTrack(track);
      });
      setIsScreenSharing(false);
      updateStream(new MediaStream(stream.getTracks()));
    }
  };

  const toggleMic = () => {
    if (!isMicOn) {
      startMic();
    } else {
      const audioTrack = stream?.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      } else {
        setIsMicOn(false);
      }
    }
  };

  const toggleCamera = () => {
    if (!isCameraOn) {
      startCamera();
    } else {
      const videoTrack = stream?.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      } else {
        setIsCameraOn(false);
      }
    }
  };

  const toggleScreenShare = () => {
    if (!isScreenSharing) {
      startScreenShare();
    } else {
      stopScreenShare();
    }
  };

  const startStreaming = () => {
    setIsStreaming(true);
  };

  const stopStreaming = () => {
    setIsStreaming(false);
  };

  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur shrink-0">
          <div className="flex items-center gap-3">
            <Radio className="h-5 w-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Live Studio</h2>
            {isStreaming && (
              <Badge className="bg-red-600 text-white animate-pulse">
                <div className="w-2 h-2 rounded-full bg-white mr-2" />
                LIVE
              </Badge>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Video Preview Area */}
        <div className="flex-1 flex items-center justify-center bg-[#0d0d0d] relative overflow-hidden">
          {(!stream || stream.getTracks().length === 0) && (
            <div className="text-center space-y-6 z-10">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/5 mx-auto">
                <VideoIcon className="h-12 w-12 text-gray-400" />
              </div>
              <div className="text-white max-w-sm px-4">
                <h3 className="text-xl font-bold mb-2">Welcome to Live Studio</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Turn on your camera, microphone, or share your screen to get started. You can stream with any combination of sources.
                </p>
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-2 px-4 rounded-md">
                  {error}
                </div>
              )}
            </div>
          )}

          <div className={cn(
            "relative w-full h-full flex items-center justify-center transition-opacity duration-500",
            (!stream || stream.getVideoTracks().length === 0) ? "opacity-0" : "opacity-100"
          )}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain mirror"
            />
            
            {isStreaming && (
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest drop-shadow-lg">LIVE PREVIEW</span>
              </div>
            )}
          </div>

          {stream && stream.getVideoTracks().length === 0 && stream.getAudioTracks().length > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a]">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                <div className="relative h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center">
                  <Mic className="h-12 w-12 text-white" />
                </div>
              </div>
              <p className="mt-6 text-white font-medium">Microphone Only Mode</p>
              <p className="text-sm text-gray-500 mt-2">No video source is currently active</p>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-8 bg-[#0d0d0d]/90 backdrop-blur-xl border-t border-white/5 shrink-0">
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className="flex items-center justify-center gap-6">
              {/* Mic Control */}
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMic}
                  className={cn(
                    "h-14 w-14 rounded-2xl border-white/10 transition-all duration-300",
                    isMicOn ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10"
                  )}
                >
                  {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </Button>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Microphone</span>
              </div>

              {/* Camera Control */}
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleCamera}
                  disabled={isScreenSharing}
                  className={cn(
                    "h-14 w-14 rounded-2xl border-white/10 transition-all duration-300",
                    isCameraOn ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10",
                    isScreenSharing && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isCameraOn ? <VideoIcon className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                </Button>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Camera</span>
              </div>

              {/* Screen Share Control */}
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleScreenShare}
                  disabled={isCameraOn}
                  className={cn(
                    "h-14 w-14 rounded-2xl border-white/10 transition-all duration-300",
                    isScreenSharing ? "bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10",
                    isCameraOn && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isScreenSharing ? <Monitor className="h-6 w-6" /> : <MonitorOff className="h-6 w-6" />}
                </Button>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Screen Share</span>
              </div>

              <div className="w-[1px] h-10 bg-white/10 mx-4" />

              {!isStreaming ? (
                <Button
                  onClick={startStreaming}
                  className="bg-red-600 hover:bg-red-700 h-14 px-10 rounded-2xl font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Radio className="h-5 w-5 mr-2" />
                  GO LIVE
                </Button>
              ) : (
                <Button
                  onClick={stopStreaming}
                  variant="outline"
                  className="h-14 px-10 rounded-2xl border-white/10 bg-white/5 text-white font-bold hover:bg-red-600/10 hover:border-red-600/50 hover:text-red-600"
                >
                  END STREAM
                </Button>
              )}

              <div className="w-[1px] h-10 bg-white/10 mx-4" />

              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-2xl border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <Settings className="h-6 w-6" />
              </Button>
            </div>

            {isStreaming && (
              <div className="text-center">
                <p className="text-sm text-gray-400">
                  Streaming to viewers • Duration: 00:00:00
                </p>
              </div>
            )}

            {error && (
              <p className="text-center text-red-500 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
