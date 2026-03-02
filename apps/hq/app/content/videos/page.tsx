"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import VideoFilterBar from "@/components/videos/video-filter-bar";
import VideoTable from "@/components/videos/video-table";
import { UploadDialog } from "@/components/upload-dialog";
import { VideoPreviewDialog } from "@/components/videos/video-preview-dialog";
import { useVideosStore } from "@/stores/videos-store";
import {
  FileSpreadsheet,
  Trash2,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

async function fetchVideos() {
  const res = await fetch('/api/videos');
  if (!res.ok) throw new Error('Failed to fetch videos');
  return res.json();
}

export default function VideosPage() {
  const router = useRouter();
  const videos = useVideosStore((state) => state.videos);
  const setVideos = useVideosStore((state) => state.setVideos);
  const setLoading = useVideosStore((state) => state.setLoading);
  const selectedVideos = useVideosStore((state) => state.selectedVideos);
  const clearSelection = useVideosStore((state) => state.clearSelection);

  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [videosToDelete, setVideosToDelete] = React.useState<string[]>([]);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [duplicateDialogOpen, setDuplicateDialogOpen] = React.useState(false);
  const [videoToDuplicate, setVideoToDuplicate] = React.useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = React.useState(false);

  const [infoDialogOpen, setInfoDialogOpen] = React.useState(false);
  const [infoDialogTitle, setInfoDialogTitle] = React.useState("");
  const [infoDialogMessage, setInfoDialogMessage] = React.useState("");

  const [previewDialogOpen, setPreviewDialogOpen] = React.useState(false);
  const [videoToPreview, setVideoToPreview] = React.useState<any>(null);

  React.useEffect(() => {
    const loadVideos = async () => {
      try {
        setInitialLoading(true);
        const data = await fetchVideos();
        const mappedVideos: any[] = data.map((v: any) => {
          let thumbnail = "/placeholder-video.jpg";
          const primaryAsset = v.assets?.find((a: any) => a.isPrimary) || v.assets?.[0];
          
          if (v.customThumbnailUrl) {
            thumbnail = v.customThumbnailUrl;
          } else if (v.muxThumbnailUrl) {
            thumbnail = v.muxThumbnailUrl;
          }

          return {
            id: v.id,
            title: v.title,
            status: v.status === "published" ? "published" : v.status === "scheduled" ? "scheduled" : "draft",
            uploadedAt: v.createdAt,
            thumbnail,
            muxPlaybackId: primaryAsset?.muxPlaybackId || null,
          };
        });
        setVideos(mappedVideos);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setInfoDialogTitle("Error");
        setInfoDialogMessage("Failed to fetch videos. Please try again.");
        setInfoDialogOpen(true);
      } finally {
        setInitialLoading(false);
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  const searchQuery = useVideosStore((state) => state.searchQuery);
  const statusFilter = useVideosStore((state) => state.statusFilter);
  const sortBy = useVideosStore((state) => state.sortBy);

  const filteredVideos = React.useMemo(() => {
    let result = [...videos];

    if (searchQuery) {
      result = result.filter((video: any) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((video: any) => video.status === statusFilter);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case "oldest":
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [videos, searchQuery, statusFilter, sortBy]);

  const handlePlayVideo = (video: any) => {
    setVideoToPreview(video);
    setPreviewDialogOpen(true);
  };

  const handleViewVideo = (id: string) => {
    router.push(`/content/videos/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setVideosToDelete([id]);
    setDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedVideos.size === 0) return;
    setVideosToDelete(Array.from(selectedVideos));
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch('/api/videos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: videosToDelete }),
      });

      if (!res.ok) throw new Error("Failed to delete videos");

      clearSelection();
      const data = await fetchVideos();
      const mappedVideos: any[] = data.map((v: any) => {
        let thumbnail = "/placeholder-video.jpg";
        const primaryAsset = v.assets?.find((a: any) => a.isPrimary) || v.assets?.[0];
        
        if (v.customThumbnailUrl) {
          thumbnail = v.customThumbnailUrl;
        } else if (v.muxThumbnailUrl) {
          thumbnail = v.muxThumbnailUrl;
        }

        return {
          id: v.id,
          title: v.title,
          status: v.status === "published" ? "published" : v.status === "scheduled" ? "scheduled" : "draft",
          uploadedAt: v.createdAt,
          thumbnail,
          muxPlaybackId: primaryAsset?.muxPlaybackId || null,
        };
      });
      setVideos(mappedVideos);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting videos:", error);
      setInfoDialogTitle("Error");
      setInfoDialogMessage("Failed to delete videos. Please try again.");
      setInfoDialogOpen(true);
    } finally {
      setIsDeleting(false);
      setVideosToDelete([]);
    }
  };

  const handleDuplicateClick = (id: string) => {
    setVideoToDuplicate(id);
    setDuplicateDialogOpen(true);
  };

  const handleConfirmDuplicate = async () => {
    if (!videoToDuplicate) return;
    
    try {
      setIsDuplicating(true);
      const res = await fetch(`/api/videos/${videoToDuplicate}/duplicate`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error("Failed to duplicate video");

      const data = await fetchVideos();
      const mappedVideos: any[] = data.map((v: any) => {
        let thumbnail = "/placeholder-video.jpg";
        const primaryAsset = v.assets?.find((a: any) => a.isPrimary) || v.assets?.[0];
        
        if (v.customThumbnailUrl) {
          thumbnail = v.customThumbnailUrl;
        } else if (v.muxThumbnailUrl) {
          thumbnail = v.muxThumbnailUrl;
        }

        return {
          id: v.id,
          title: v.title,
          status: v.status === "published" ? "published" : v.status === "scheduled" ? "scheduled" : "draft",
          uploadedAt: v.createdAt,
          thumbnail,
          muxPlaybackId: primaryAsset?.muxPlaybackId || null,
        };
      });
      setVideos(mappedVideos);
      setDuplicateDialogOpen(false);
      setVideoToDuplicate(null);
    } catch (error) {
      console.error("Error duplicating video:", error);
      setInfoDialogTitle("Error");
      setInfoDialogMessage("Failed to duplicate video. Please try again.");
      setInfoDialogOpen(true);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleCreateVideo = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadDialogClose = async (open: boolean) => {
    setUploadDialogOpen(open);
    if (!open) {
      const data = await fetchVideos();
      const mappedVideos: any[] = data.map((v: any) => {
        let thumbnail = "/placeholder-video.jpg";
        const primaryAsset = v.assets?.find((a: any) => a.isPrimary) || v.assets?.[0];
        
        if (v.customThumbnailUrl) {
          thumbnail = v.customThumbnailUrl;
        } else if (v.muxThumbnailUrl) {
          thumbnail = v.muxThumbnailUrl;
        }

        return {
          id: v.id,
          title: v.title,
          status: v.status === "published" ? "published" : v.status === "scheduled" ? "scheduled" : "draft",
          uploadedAt: v.createdAt,
          thumbnail,
          muxPlaybackId: primaryAsset?.muxPlaybackId || null,
        };
      });
      setVideos(mappedVideos);
    }
  };

  return (
    <Shell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Videos</h1>
          <div className="flex items-center gap-2">
            {selectedVideos.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDeleteClick}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selectedVideos.size})
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  More actions
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export to CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={selectedVideos.size === 0}
                  onClick={handleBulkDeleteClick}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={handleCreateVideo}>
              <Upload className="mr-2 h-4 w-4" />
              Upload videos
            </Button>
          </div>
        </div>

        <VideoFilterBar />

        <VideoTable
          loading={initialLoading}
          videos={filteredVideos}
          onPlay={handlePlayVideo}
          onEdit={handleViewVideo}
          onDelete={handleDeleteClick}
          onDuplicate={handleDuplicateClick}
        />
      </div>

      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={handleUploadDialogClose}
      />
      
      <VideoPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        video={videoToPreview}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {videosToDelete.length === 1 ? "this video" : `${videosToDelete.length} videos`} and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setVideosToDelete([])}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to duplicate this video? A new draft copy will be created.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setVideoToDuplicate(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDuplicate}
              disabled={isDuplicating}
            >
              {isDuplicating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Duplicate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{infoDialogTitle}</DialogTitle>
            <DialogDescription>{infoDialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setInfoDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
