"use client";

import { MoreVertical, Play, Clock, Eye, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/utils";

export interface VideoData {
  id: string;
  title: string;
  thumbnail?: string;
  duration: string;
  views: string;
  status: "published" | "draft" | "scheduled";
  publishedAt?: string;
  scheduledFor?: string;
  muxPlaybackId?: string | null;
}

interface VideoCardProps {
  video: VideoData;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusStyles: Record<
  VideoData["status"],
  { label: string; color: string }
> = {
  published: { label: "Published", color: "bg-green-500/10 text-green-700" },
  draft: { label: "Draft", color: "bg-gray-500/10 text-gray-700" },
  scheduled: { label: "Scheduled", color: "bg-yellow-500/10 text-yellow-700" },
};

export function VideoCard({ video, onEdit, onDelete }: VideoCardProps) {
  const status = statusStyles[video.status];

  return (
    <Card className="border-border/60 bg-white overflow-hidden">
      <div className="relative aspect-video bg-muted">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Play className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </span>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{video.views} views</p>
            {video.publishedAt && (
              <p className="text-xs text-muted-foreground">
                {video.publishedAt}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", status.color)}>{status.label}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(video.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(video.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
