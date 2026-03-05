"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Plus, X, GripVertical } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlaylist, useUpdatePlaylist } from "@/hooks/use-playlists";
import { useMutation } from "@/hooks/use-data-fetch";
import { usePlaylistFormStore } from "@/stores/playlist-form-store";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCategories } from "@/hooks/use-categories";
import { useCreators } from "@/hooks/use-creators";
import { useVideos } from "@/hooks/use-videos";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { VideoSelectorDialog } from "@/components/playlists/VideoSelectorDialog";
import { cn } from "@/utils";

export default function PlaylistEditPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;

  const [isVideosDialogOpen, setIsVideosDialogOpen] = React.useState(false);
  const [draggedVideoIndex, setDraggedVideoIndex] = React.useState<number | null>(null);

  const { playlist, loading: fetching, refetch } = usePlaylist(playlistId);
  const { mutate: updatePlaylist, loading: saving } = useMutation(`/api/playlists/${playlistId}`, "PATCH");
  
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 20;
  const { categories } = useCategories();
  const { creators } = useCreators();
  const { videos: allVideos } = useVideos();

  const formData = usePlaylistFormStore((state) => state.formData);
  const setFormData = usePlaylistFormStore((state) => state.setFormData);
  const initializeForm = usePlaylistFormStore((state) => state.initializeForm);
  const imageUrls = usePlaylistFormStore((state) => state.imageUrls);
  const setImageUrls = usePlaylistFormStore((state) => state.setImageUrls);

  const initializedRef = React.useRef(false);

  React.useEffect(() => {
    if (playlist && !initializedRef.current) {
      initializedRef.current = true;
      initializeForm(playlist);
      
      if (playlist.thumbnailStorageBucket && playlist.thumbnailStoragePath) {
        generateSignedUrl(playlist.thumbnailStorageBucket, playlist.thumbnailStoragePath);
      }
    }
  }, [playlist?.id]);

  const generateSignedUrl = async (bucket: string, path: string) => {
    try {
      const response = await fetch('/api/videos/get-signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket, path }),
      });
      if (response.ok) {
        const data = await response.json();
        setImageUrls({ thumbnail: data.signedUrl });
      }
    } catch (error) {
      console.error('Error generating signed URL:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedVideoIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedVideoIndex === null || draggedVideoIndex === dropIndex) return;

    const newVideos = [...formData.videos];
    const [draggedItem] = newVideos.splice(draggedVideoIndex, 1);
    newVideos.splice(dropIndex, 0, draggedItem);

    const reorderedVideos = newVideos.map((v: any, i: any) => ({
      ...v,
      position: i
    }));

    setFormData({ videos: reorderedVideos });
    setDraggedVideoIndex(null);
  };

  const handleSave = async () => {
    try {
      const offers: any[] = [];
      formData.rentalOptions.forEach(opt => {
        offers.push({
          offerType: 'rental',
          amountCents: Math.round(opt.price * 100),
          rentalDurationDays: opt.duration,
          maxSimultaneousStreams: opt.maxStreams || 0,
          tierLabel: opt.tierLabel || "",
          currency: 'usd',
        });
      });
      
      formData.purchaseOptions.forEach(opt => {
        offers.push({
          offerType: 'purchase',
          amountCents: Math.round(opt.price * 100),
          maxSimultaneousStreams: opt.maxStreams || 0,
          tierLabel: opt.tierLabel || "",
          currency: 'usd',
        });
      });

      await updatePlaylist({
        title: formData.title,
        descriptionRich: formData.descriptionRich,
        shortDescription: formData.shortDescription,
        status: formData.status,
        isFree: formData.isFree,
        publishScheduledAt: formData.status === 'scheduled' ? formData.publishScheduledAt : null,
        trailerVideoId: formData.trailerVideoId || null,
        offers,
        creators: formData.creatorIds,
        categories: formData.categoryIds,
        filterValues: formData.filterValueIds,
        items: formData.videos.map((v: any, i: any) => ({
          videoId: v.videoId,
          position: i,
          dripDays: v.dripDays,
        })),
      });
      refetch();
    } catch (error) {
      console.error("Failed to save playlist:", error);
    }
  };

  const thumbnailRef = React.useRef<HTMLInputElement>(null);

  const handleThumbnailUpload = async (file: File) => {
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('playlistId', playlistId);

    try {
      const res = await fetch('/api/playlists/upload-thumbnail', {
        method: 'POST',
        body: uploadData,
      });
      if (res.ok) {
        const result = await res.json();
        setImageUrls({ thumbnail: result.publicUrl });
        setFormData({
          thumbnailStorageBucket: result.storageBucket,
          thumbnailStoragePath: result.storagePath,
        });
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  if (fetching) {
    return (
      <Shell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/playlists')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">{formData.title || "Untitled Collection"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save changes
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          <div className="space-y-6">
            <Card className="border-border/60">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Collection title</Label>
                  <Input 
                    value={formData.title} 
                    onChange={(e) => setFormData({ title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <RichTextEditor 
                    value={formData.descriptionRich} 
                    onChange={(val) => setFormData({ descriptionRich: val })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Short description</Label>
                  <Textarea 
                    value={formData.shortDescription} 
                    onChange={(e) => setFormData({ shortDescription: e.target.value })}
                    placeholder="Short summary for SEO and catalog..."
                    maxLength={140}
                  />
                  <p className="text-[10px] text-right text-muted-foreground">Characters left: {140 - (formData.shortDescription?.length || 0)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Organize</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.categoryIds.map(catId => (
                      <Badge key={catId} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 uppercase text-[10px] font-bold py-1 px-3">
                        {categories.find(c => c.id === catId)?.name || catId}
                        <X className="h-3 w-3 ml-2 cursor-pointer" onClick={() => setFormData({ categoryIds: formData.categoryIds.filter((id: any) => id !== catId)})} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
               <CardContent className="p-0">
                 <div 
                   className="aspect-video bg-muted relative rounded-t-lg overflow-hidden group cursor-pointer"
                   onClick={() => thumbnailRef.current?.click()}
                 >
                   {imageUrls.thumbnail ? (
                     <img src={imageUrls.thumbnail} className="w-full h-full object-cover" />
                   ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                       <Plus className="h-12 w-12 mb-2 opacity-50" />
                       <span className="text-sm">Horizontal thumbnail (1480x840px)</span>
                     </div>
                   )}
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium">
                     Click to upload thumbnail
                   </div>
                 </div>
                 <input 
                   type="file" 
                   ref={thumbnailRef} 
                   className="hidden" 
                   accept="image/*" 
                   onChange={(e) => e.target.files?.[0] && handleThumbnailUpload(e.target.files[0])}
                 />
                 <div className="p-4 border-t bg-gray-50/50">
                   <p className="text-xs text-muted-foreground">Horizontal thumbnail (1480x840px)</p>
                   <p className="text-xs text-muted-foreground mt-1">Appears as a thumbnail on your catalog page</p>
                 </div>
               </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">Playlist and drip settings</CardTitle>
                <Badge variant="outline" className="text-[10px] font-bold">
                  {formData.videos.length} TOTAL ITEMS
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {(() => {
                  const totalPages = Math.ceil(formData.videos.length / itemsPerPage);
                  const paginatedVideos = formData.videos.slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  );

                  return (
                    <>
                      {paginatedVideos.map((v: any, i: any) => {
                        const globalIndex = (currentPage - 1) * itemsPerPage + i;
                        return (
                          <div 
                            key={v.id || v.videoId} 
                            draggable
                            onDragStart={(e) => handleDragStart(e, globalIndex)}
                            onDragOver={(e) => handleDragOver(e, globalIndex)}
                            onDrop={(e) => handleDrop(e, globalIndex)}
                            className={cn(
                              "flex items-center gap-4 p-3 border rounded-lg bg-white group hover:border-blue-200 transition-colors cursor-default",
                              draggedVideoIndex === globalIndex && "opacity-50 border-blue-500"
                            )}
                          >
                            <GripVertical className="h-5 w-5 text-muted-foreground/50 cursor-grab active:cursor-grabbing" />
                            <div className="h-12 w-20 rounded bg-muted overflow-hidden flex-shrink-0">
                              {v.thumbnailUrl && <img src={v.thumbnailUrl} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold truncate">{v.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-muted-foreground uppercase font-medium">Position: {globalIndex + 1}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs text-muted-foreground hover:text-destructive"
                                onClick={() => {
                                  setFormData({
                                    videos: formData.videos.filter((vid: any) => vid.videoId !== v.videoId)
                                  });
                                }}
                              >
                                 <X className="h-4 w-4 mr-1"/>Remove
                               </Button>
                            </div>
                          </div>
                        );
                      })}

                      {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                          <p className="text-xs text-muted-foreground">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, formData.videos.length)} of {formData.videos.length}
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-dashed py-6"
                  onClick={() => setIsVideosDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />Select Videos to Add
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/60">
              <CardContent className="p-6 space-y-4">
                <RadioGroup value={formData.status} onValueChange={(val: any) => setFormData({ status: val })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unpublished" id="unpublished" />
                    <Label htmlFor="unpublished">Unpublished</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="published" id="published" />
                    <Label htmlFor="published">Published</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="scheduled" id="scheduled" />
                    <Label htmlFor="scheduled">Scheduled</Label>
                  </div>
                </RadioGroup>
                {formData.status === 'scheduled' && (
                  <div className="pt-2 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        className="h-9 text-xs"
                        value={formData.publishScheduledAt ? formData.publishScheduledAt.split("T")[0] : ""}
                        onChange={(e) => {
                          const time = formData.publishScheduledAt?.split("T")[1] || "12:00:00";
                          setFormData({ publishScheduledAt: `${e.target.value}T${time}` });
                        }}
                      />
                      <Input
                        type="time"
                        className="h-9 text-xs"
                        value={formData.publishScheduledAt ? formData.publishScheduledAt.split("T")[1]?.slice(0, 5) : "12:00"}
                        onChange={(e) => {
                          const date = formData.publishScheduledAt?.split("T")[0] || new Date().toISOString().split("T")[0];
                          setFormData({ publishScheduledAt: `${date}T${e.target.value}:00` });
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={formData.isFree ? "free" : "gated"} onValueChange={(val) => setFormData({ isFree: val === "free" })}>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="gated" id="access-gated" className="mt-1" />
                    <div className="space-y-0.5">
                      <Label htmlFor="access-gated">Gated</Label>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">Only users with access will be able to watch this collection</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 mt-4">
                    <RadioGroupItem value="free" id="access-free" className="mt-1" />
                    <div className="space-y-0.5">
                      <Label htmlFor="access-free">Free for all users</Label>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">All users will be able to watch this collection</p>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <Separator />
                 <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                       <Label className="text-xs font-bold">Rental price</Label>
                    </div>
                     <div className="flex gap-2">
                        <div className="relative flex-1">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs uppercase">USD</span>
                           <Input 
                            className="pl-12 h-9 text-sm" 
                            placeholder="0.00" 
                            type="number" 
                            value={formData.rentalOptions[0]?.price || ""}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const newOptions = [...formData.rentalOptions];
                              if (newOptions.length === 0) {
                                newOptions.push({ duration: 1, price: val });
                              } else {
                                newOptions[0].price = val;
                              }
                              setFormData({ rentalOptions: newOptions });
                            }}
                           />
                        </div>
                        <Select 
                          value={formData.rentalOptions[0]?.duration.toString() || "1"}
                          onValueChange={(val) => {
                            const newOptions = [...formData.rentalOptions];
                            if (newOptions.length === 0) {
                              newOptions.push({ duration: parseInt(val), price: 0 });
                            } else {
                              newOptions[0].duration = parseInt(val);
                            }
                            setFormData({ rentalOptions: newOptions });
                          }}
                        >
                           <SelectTrigger className="w-[80px] h-9 text-sm">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="1">1 day</SelectItem>
                              <SelectItem value="7">7 days</SelectItem>
                              <SelectItem value="30">30 days</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>

                    <div className="flex items-center justify-between pt-2">
                       <Label className="text-xs font-bold">One-time purchase price</Label>
                    </div>
                     <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs uppercase">USD</span>
                        <Input 
                          className="pl-12 h-9 text-sm" 
                          placeholder="0.00" 
                          type="number" 
                          value={formData.purchaseOptions[0]?.price || ""}
                          onChange={(e) => {
                            const newOptions = [...formData.purchaseOptions];
                            if (newOptions.length === 0) {
                              newOptions.push({ price: parseFloat(e.target.value) || 0, tierLabel: "", maxStreams: 0 });
                            } else {
                              newOptions[0].price = parseFloat(e.target.value) || 0;
                            }
                            setFormData({ purchaseOptions: newOptions });
                          }}
                        />
                     </div>
                 </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
               <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Trailer</CardTitle>
               </CardHeader>
               <CardContent>
                  <Select value={formData.trailerVideoId} onValueChange={(val) => setFormData({ trailerVideoId: val })}>
                    <SelectTrigger>
                       <SelectValue placeholder="Choose a trailer video" />
                    </SelectTrigger>
                    <SelectContent>
                       {allVideos.map((v: any) => (
                         <SelectItem key={v.id} value={v.id}>{v.title}</SelectItem>
                       ))}
                    </SelectContent>
                  </Select>
               </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <VideoSelectorDialog 
        open={isVideosDialogOpen}
        onOpenChange={setIsVideosDialogOpen}
        selectedIds={formData.videos.map((v: any) => v.videoId)}
        onSelect={(selectedVideos: any[]) => {
          const currentVideos = [...formData.videos];
          const newVideos = selectedVideos
            .filter(v => !currentVideos.some(cv => cv.videoId === v.id))
            .map((v: any, i: any) => ({
              id: "",
              videoId: v.id,
              title: v.title,
              thumbnailUrl: v.customThumbnailUrl || v.muxThumbnailUrl || "/placeholder-video.jpg",
              position: currentVideos.length + i,
              dripDays: 0
            }));
          
          setFormData({
            videos: [...currentVideos, ...newVideos]
          });
        }}
      />
    </Shell>
  );
}
