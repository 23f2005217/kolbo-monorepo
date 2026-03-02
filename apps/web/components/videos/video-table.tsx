import * as React from "react";
import { Loader2, Upload } from "lucide-react";
import { useVideosStore } from "@/stores/videos-store";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import VideoRow, { VideoRowProps } from "./video-row";

export interface VideoTableProps {
  loading: boolean;
  videos: any[];
  onPlay: (video: any) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const VideoTable = React.memo(function VideoTable({ loading, videos, onPlay, onEdit, onDelete, onDuplicate }: VideoTableProps) {
  const selectedVideos = useVideosStore((state) => state.selectedVideos);
  const toggleSelectAll = useVideosStore((state) => state.toggleSelectAll);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12">
              <Checkbox
                checked={
                  videos.length > 0 &&
                  selectedVideos.size === videos.length
                }
                onCheckedChange={() => toggleSelectAll(videos.map(v => v.id))}
              />
            </TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Videos
            </TableHead>
            <TableHead className="w-32 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="w-40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Uploaded on
            </TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr:last-child]:border-0 [&_td]:py-4 [&_tr]:border-b">
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading videos...
                </div>
              </TableCell>
            </TableRow>
          ) : videos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Upload className="h-8 w-8 opacity-50" />
                  </div>
                  <p className="text-lg font-medium">No videos yet</p>
                  <p className="text-sm">
                    Upload your first video to get started
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            videos.map((video) => (
              <VideoRow
                key={video.id}
                video={video}
                onPlay={onPlay}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
});

export default VideoTable;
