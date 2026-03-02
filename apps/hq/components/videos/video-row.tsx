import * as React from "react";

import { Play, MoreVertical, Trash2, Copy, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useVideosStore } from "@/stores/videos-store";

export interface VideoRowProps {
  video: {
    id: string;
    thumbnail: string;
    title: string;
    status: "published" | "draft" | "scheduled";
    uploadedAt: string;
    muxPlaybackId: string | null;
  };
  onPlay: (video: any) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const statusConfig = {
  published: {
    label: "PUBLISHED",
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },
  draft: {
    label: "DRAFT",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  },
  scheduled: {
    label: "SCHEDULED",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const VideoRow = React.memo(function VideoRow({ video, onPlay, onEdit, onDelete, onDuplicate }: VideoRowProps) {
  const toggleSelectVideo = useVideosStore((state) => state.toggleSelectVideo);
  const selectedVideos = useVideosStore((state) => state.selectedVideos);
  const isSelected = selectedVideos.has(video.id);

  return (
    <tr className="group">
      <td>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleSelectVideo(video.id)}
        />
      </td>
      <td>
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{video.title}</p>
          </div>
        </div>
      </td>
      <td>
        <Badge
          variant="secondary"
          className={`text-xs font-medium ${statusConfig[video.status].className}`}
        >
          {statusConfig[video.status].label}
        </Badge>
      </td>
      <td className="text-muted-foreground">
        {formatDate(video.uploadedAt)}
      </td>
      <td>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100"
            onClick={() => onPlay(video)}
            disabled={!video.muxPlaybackId}
            title={video.muxPlaybackId ? 'Play video' : 'Video is still processing'}
          >
            <Play className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onPlay(video)}
                disabled={!video.muxPlaybackId}
              >
                <Play className="mr-2 h-4 w-4" />
                {video.muxPlaybackId ? 'Play' : 'Processing...'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(video.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(video.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(video.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
});

export default VideoRow;
