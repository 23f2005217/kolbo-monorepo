"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, Trash2, ChevronDown, Loader2 } from "lucide-react";
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
import { VideoPreviewDialog } from "@/components/videos/video-preview-dialog";
import { useVideosStore } from "@/stores/videos-store";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

async function fetchVideos(page: number, pageSize: number, status?: string, search?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (status && status !== 'all') params.set('status', status);
  if (search) params.set('search', search);

  const res = await fetch(`/api/videos?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch videos');
  return res.json();
}

function mapVideo(v: any) {
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
}

export default function VideosPage() {
  const router = useRouter();
  const videos = useVideosStore((state) => state.videos);
  const total = useVideosStore((state) => state.total);
  const setVideos = useVideosStore((state) => state.setVideos);
  const setTotal = useVideosStore((state) => state.setTotal);
  const setLoading = useVideosStore((state) => state.setLoading);
  const selectedVideos = useVideosStore((state) => state.selectedVideos);
  const clearSelection = useVideosStore((state) => state.clearSelection);

  const searchQuery = useVideosStore((state) => state.searchQuery);
  const statusFilter = useVideosStore((state) => state.statusFilter);
  const currentPage = useVideosStore((state) => state.currentPage);
  const pageSize = useVideosStore((state) => state.pageSize);
  const setCurrentPage = useVideosStore((state) => state.setCurrentPage);
  const setPageSize = useVideosStore((state) => state.setPageSize);

  const [initialLoading, setInitialLoading] = React.useState(true);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [videosToDelete, setVideosToDelete] = React.useState<string[]>([]);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const [infoDialogOpen, setInfoDialogOpen] = React.useState(false);
  const [infoDialogTitle, setInfoDialogTitle] = React.useState("");
  const [infoDialogMessage, setInfoDialogMessage] = React.useState("");

  const [previewDialogOpen, setPreviewDialogOpen] = React.useState(false);
  const [videoToPreview, setVideoToPreview] = React.useState<any>(null);

  const totalPages = Math.ceil(total / pageSize);

  React.useEffect(() => {
    const loadVideos = async () => {
      try {
        setInitialLoading(true);
        const data = await fetchVideos(currentPage, pageSize, statusFilter, searchQuery);
        const mappedVideos: any[] = data.videos.map(mapVideo);
        setVideos(mappedVideos);
        setTotal(data.pagination.total);
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
  }, [currentPage, pageSize, statusFilter, searchQuery]);

  const handlePlayVideo = (video: any) => {
    setVideoToPreview(video);
    setPreviewDialogOpen(true);
  };

  const handleViewVideo = (id: string) => {
    router.push(`/${id}`);
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
      const data = await fetchVideos(currentPage, pageSize, statusFilter, searchQuery);
      const mappedVideos: any[] = data.videos.map(mapVideo);
      setVideos(mappedVideos);
      setTotal(data.pagination.total);
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
            <Button size="sm" onClick={() => router.push('/upload')}>
              <Upload className="mr-2 h-4 w-4" />
              Upload videos
            </Button>
          </div>
        </div>

        <VideoFilterBar />

        <VideoTable
          loading={initialLoading}
          videos={videos}
          onPlay={handlePlayVideo}
          onEdit={handleViewVideo}
          onDelete={handleDeleteClick}
          onDuplicate={() => { }}
        />

        {initialLoading && total > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, total)} of {total} videos
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* {totalPages > 1 && ( */}
            {/*   <div className="flex items-center gap-4"> */}
            {/*     <Pagination> */}
            {/*       <PaginationContent> */}
            {/*         <PaginationItem> */}
            {/*           <PaginationPrevious */}
            {/*             href="#" */}
            {/*             onClick={(e) => { */}
            {/*               e.preventDefault(); */}
            {/*               if (currentPage > 1) setCurrentPage(currentPage - 1); */}
            {/*             }} */}
            {/*             className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""} */}
            {/*           /> */}
            {/*         </PaginationItem> */}
            {/*         {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => { */}
            {/*           if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) { */}
            {/*             return ( */}
            {/*               <PaginationItem key={page}> */}
            {/*                 <PaginationLink */}
            {/*                   href="#" */}
            {/*                   onClick={(e) => { */}
            {/*                     e.preventDefault(); */}
            {/*                     setCurrentPage(page); */}
            {/*                   }} */}
            {/*                   isActive={currentPage === page} */}
            {/*                 > */}
            {/*                   {page} */}
            {/*                 </PaginationLink> */}
            {/*               </PaginationItem> */}
            {/*             ); */}
            {/*           } */}
            {/*           if (page === currentPage - 2 || page === currentPage + 2) { */}
            {/*             return ( */}
            {/*               <PaginationItem key={page}> */}
            {/*                 <PaginationEllipsis /> */}
            {/*               </PaginationItem> */}
            {/*             ); */}
            {/*           } */}
            {/*           return null; */}
            {/*         })} */}
            {/*         <PaginationItem> */}
            {/*           <PaginationNext */}
            {/*             href="#" */}
            {/*             onClick={(e) => { */}
            {/*               e.preventDefault(); */}
            {/*               if (currentPage < totalPages) setCurrentPage(currentPage + 1); */}
            {/*             }} */}
            {/*             className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""} */}
            {/*           /> */}
            {/*         </PaginationItem> */}
            {/*       </PaginationContent> */}
            {/*     </Pagination> */}
            {/*   </div> */}
            {/* )} */}
          </div>
        )}
      </div>

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
