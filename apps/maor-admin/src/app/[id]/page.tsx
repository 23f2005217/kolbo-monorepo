"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Download, ExternalLink, Upload } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVideo, useUpdateVideo, useVideos } from "@/hooks/use-videos";
import { useCategories } from "@/hooks/use-categories";
import { useBundles } from "@/hooks/use-bundles";
import { useSubsites } from "@/hooks/use-subsites";
import { useCreators } from "@/hooks/use-creators";
import { useSubscriptionPlans } from "@/hooks/use-subscription-plans";
import { useFilters } from "@/hooks/use-filters";
import VideoPlayer from "@/components/ui/video-player";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Badge } from "@/components/ui/badge";
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
import AboutSection from "@/components/video-edit/about-section";
import OrganizeSection from "@/components/video-edit/organize-section";
import SEOSection from "@/components/video-edit/seo-section";
import VisibilitySection from "@/components/video-edit/visibility-section";
import AccessSection from "@/components/video-edit/access-section";
import AdsSection from "@/components/video-edit/ads-section";
import SubscriptionSection from "@/components/video-edit/subscription-section";
import RentalPricesSection from "@/components/video-edit/rental-prices-section";
import PurchasePriceSection from "@/components/video-edit/purchase-price-section";
import BundlesSection from "@/components/video-edit/bundles-section";
import { useVideoFormStore } from "@/stores/video-form-store";

export default function VideoEditPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const { video, loading, error, refetch } = useVideo(videoId);
  const { videos } = useVideos();
  const { categories } = useCategories();
  const { bundles } = useBundles();
  const { subsites } = useSubsites();
  const { creators } = useCreators();
  const { filters } = useFilters();
  const { plans } = useSubscriptionPlans();
  const { updateVideo, loading: saving } = useUpdateVideo(videoId);

  const formData = useVideoFormStore((state) => state.formData);
  const initializeForm = useVideoFormStore((state) => state.initializeForm);
  const setFormData = useVideoFormStore((state) => state.setFormData);
  const setImageUrls = useVideoFormStore((state) => state.setImageUrls);
  const imageUrls = useVideoFormStore((state) => state.imageUrls);
  const setDeleteDialogOpen = useVideoFormStore((state) => state.setDeleteDialogOpen);
  const setReplaceDialogOpen = useVideoFormStore((state) => state.setReplaceDialogOpen);
  const setDownloadDialogOpen = useVideoFormStore((state) => state.setDownloadDialogOpen);
  const setErrorDialogOpen = useVideoFormStore((state) => state.setErrorDialogOpen);
  const setErrorMessage = useVideoFormStore((state) => state.setErrorMessage);
  const setDownloadStatus = useVideoFormStore((state) => state.setDownloadStatus);
  const setThumbnailUploading = useVideoFormStore((state) => state.setThumbnailUploading);
  
  const deleteDialogOpen = useVideoFormStore((state) => state.deleteDialogOpen);
  const replaceDialogOpen = useVideoFormStore((state) => state.replaceDialogOpen);
  const downloadDialogOpen = useVideoFormStore((state) => state.downloadDialogOpen);
  const errorDialogOpen = useVideoFormStore((state) => state.errorDialogOpen);
  const errorMessage = useVideoFormStore((state) => state.errorMessage);
  const downloadStatus = useVideoFormStore((state) => state.downloadStatus);
  const thumbnailUploading = useVideoFormStore((state) => state.thumbnailUploading);

  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isReplacing, setIsReplacing] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [signedPreviewUrl, setSignedPreviewUrl] = React.useState<string | null>(null);

  const horizontalThumbnailRef = React.useRef<HTMLInputElement>(null);
  const verticalThumbnailRef = React.useRef<HTMLInputElement>(null);
  const replaceVideoRef = React.useRef<HTMLInputElement>(null);
  const initializedRef = React.useRef(false);

  const generateSignedUrls = React.useCallback(async (images: Array<{imageType: string, storageBucket: string, storagePath: string}>) => {
    const urls: Record<string, string> = {};
    
    for (const image of images) {
      try {
        const response = await fetch('/api/videos/get-signed-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bucket: image.storageBucket,
            path: image.storagePath,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          urls[image.imageType] = data.signedUrl;
        }
      } catch (error) {
        console.error('Error generating signed URL:', error);
      }
    }
    
    setImageUrls(urls);
  }, []);

  React.useEffect(() => {
    initializedRef.current = false;
  }, [videoId]);

  React.useEffect(() => {
    if (video && !initializedRef.current) {
      initializedRef.current = true;
      initializeForm(video);

      if (video.images && video.images.length > 0) {
        generateSignedUrls(video.images.map((img: any) => ({
          imageType: img.imageType,
          storageBucket: img.storageBucket,
          storagePath: img.storagePath,
        })));
      }
    }
  }, [video, videoId, initializeForm, generateSignedUrls]);

  const handleSave = async () => {
    try {
      const currentFormData = useVideoFormStore.getState().formData;

      const offers: any[] = [];

      for (const option of currentFormData.rentalOptions) {
        offers.push({
          offerType: 'rental',
          amountCents: Math.round(option.price * 100),
          pricePerDeviceCents: Math.round((option.pricePerDevice || 0) * 100),
          rentalDurationDays: option.duration,
          maxSimultaneousStreams: option.maxStreams || 0,
          tierLabel: option.tierLabel || "",
          currency: 'usd',
        });
      }

      for (const option of currentFormData.purchaseOptions) {
        offers.push({
          offerType: 'purchase',
          amountCents: Math.round(option.price * 100),
          pricePerDeviceCents: Math.round((option.pricePerDevice || 0) * 100),
          maxSimultaneousStreams: option.maxStreams || 0,
          tierLabel: option.tierLabel || "",
          currency: 'usd',
        });
      }

       await updateVideo({
         title: currentFormData.title,
         descriptionRich: currentFormData.descriptionRich,
         shortDescription: currentFormData.shortDescription,
         status: currentFormData.status,
         categoryId: currentFormData.categoryId || null,
         subsiteId: currentFormData.subsiteId || null,
         isFree: currentFormData.isFree,
         hasAds: currentFormData.hasAds,
         adsMode: currentFormData.adsMode,
         midRollIntervalMinutes: currentFormData.midRollMinutes,
         publishScheduledAt: currentFormData.publishScheduledAt || null,
         seoTitle: currentFormData.seoTitle,
         seoDescription: currentFormData.seoDescription,
         trailerVideoId: currentFormData.trailerVideoId || null,
         bundles: currentFormData.bundles,
         offers,
         searchTags: currentFormData.searchTags,
         creators: currentFormData.creators,
         filterValueIds: currentFormData.filterValueIds,
         images: currentFormData.images,
         subscriptionPlanIds: currentFormData.subscriptionPlanIds,
         minimumAge: currentFormData.minimumAge,
         maxSimultaneousStreams: currentFormData.maxSimultaneousStreams,
         adTagUrl: currentFormData.adTagUrl || null,
       });

       initializedRef.current = false;
       refetch();
    } catch (e) {
      console.error("Failed to save", e);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch('/api/videos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: [videoId] }),
      });

      if (!res.ok) throw new Error('Failed to delete video');

      router.push('/');
    } catch (error) {
      console.error('Error deleting video:', error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

   const primaryAsset = video?.assets?.find((a: any) => a.isPrimary) || video?.assets?.[0];
   const signedPlaybackId = primaryAsset?.muxPlaybackId;
   const videoUrl = signedPlaybackId
     ? `https://stream.mux.com/${signedPlaybackId}.m3u8`
     : null;

   const [muxDefaultThumb, setMuxDefaultThumb] = React.useState<string | null>(null);
   React.useEffect(() => {
     if (signedPlaybackId && !imageUrls.horizontal) {
       fetch('/api/videos/mux-thumbnail', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ playbackId: signedPlaybackId, width: 320, height: 180, fitMode: 'smartcrop' }),
       })
         .then(r => r.json())
         .then(d => { if (d.url) setMuxDefaultThumb(d.url); })
         .catch(() => {});
     }
   }, [signedPlaybackId, imageUrls.horizontal]);

   React.useEffect(() => {
     if (video && !loading) {
       fetch(`/api/videos/${videoId}/playback-access`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({}),
       })
         .then(r => r.json())
         .then(data => {
           if (data.playbackUrl) {
             setSignedPreviewUrl(data.playbackUrl);
           }
         })
         .catch(err => console.error('Error fetching admin preview access:', err));
     }
   }, [video, videoId, loading]);

  const handleThumbnailUpload = async (file: File, imageType: 'horizontal' | 'vertical' | 'hero') => {
    if (!file) return;
    
    setThumbnailUploading(true);
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('videoId', videoId);
      formDataUpload.append('imageType', imageType);

      const response = await fetch('/api/videos/upload-thumbnail', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Failed to upload thumbnail');
      }

      const result = await response.json();
      
      setFormData({
        images: [
          ...formData.images.filter((img: any) => img.imageType !== imageType),
          {
            imageType,
            storageBucket: result.storageBucket,
            storagePath: result.storagePath,
          }
        ]
      });

       if (result.publicUrl) {
         setImageUrls({
           ...imageUrls,
           [imageType]: result.publicUrl
         });
       }
    } catch (error: any) {
      console.error('Error uploading thumbnail:', error);
      setErrorMessage(error.message || 'Failed to upload thumbnail. Please try again.');
      setErrorDialogOpen(true);
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleReplaceVideo = async (file: File) => {
    if (!file) return;
    
    setIsReplacing(true);
    setUploadProgress(0);

    try {
      const assetId = video?.assets?.[0]?.muxAssetId;
      if (assetId) {
        await fetch('/api/mux/delete-asset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId }),
        });
      }

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          videoId,
          filename: file.name,
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to create upload');
      }

      const { url: uploadUrl, id: muxUploadId } = await uploadResponse.json();

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(xhr.response);
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(file);
      });

       await fetch('/api/videos/update-mux-asset', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ videoId, muxUploadId }),
       });

       setReplaceDialogOpen(false);
    } catch (error) {
      console.error('Error replacing video:', error);
      setErrorMessage('Failed to replace video. Please try again.');
      setErrorDialogOpen(true);
    } finally {
      setIsReplacing(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Shell>
    );
  }

  if (error || !video) {
    return (
      <Shell>
        <div className="text-center py-12 text-red-600">
          Error loading video: {error?.message || "Video not found"}
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{formData.title || "Untitled Video"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save changes
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <AboutSection />
            <OrganizeSection 
              categories={categories} 
              subsites={subsites} 
              creators={creators} 
              filters={filters}
            />
            <Card>
              <CardHeader>
                <CardTitle>Thumbnails</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <input
                  type="file"
                  ref={horizontalThumbnailRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleThumbnailUpload(e.target.files[0], 'horizontal');
                    }
                  }}
                />
                <input
                  type="file"
                  ref={verticalThumbnailRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleThumbnailUpload(e.target.files[0], 'vertical');
                    }
                  }}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Horizontal thumbnail (1920x1080)</Label>
                    <div 
                      role="button"
                      tabIndex={0}
                      className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary transition-colors overflow-hidden relative group"
                      onClick={() => horizontalThumbnailRef.current?.click()}
                      onKeyDown={(e) => e.key === 'Enter' && horizontalThumbnailRef.current?.click()}
                    >
                      {imageUrls.horizontal ? (
                        <>
                          <img
                            src={imageUrls.horizontal}
                            alt="Custom horizontal thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium">
                            Click to replace thumbnail
                          </div>
                        </>
                      ) : muxDefaultThumb ? (
                        <>
                          <img
                            src={muxDefaultThumb}
                            alt="Default thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-medium">
                            Click to upload a custom thumbnail
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 p-4 text-center">
                          <span className="text-muted-foreground text-sm">Click to upload a custom thumbnail</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Vertical thumbnail (1080x1920)</Label>
                    <div 
                      role="button"
                      tabIndex={0}
                      className="w-32 aspect-[9/16] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary transition-colors overflow-hidden relative group"
                      onClick={() => verticalThumbnailRef.current?.click()}
                      onKeyDown={(e) => e.key === 'Enter' && verticalThumbnailRef.current?.click()}
                    >
                      {imageUrls.vertical ? (
                        <>
                          <img
                            src={imageUrls.vertical}
                            alt="Custom vertical thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium text-center px-1">
                            Click to replace
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground text-center px-1">Click to upload</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <SEOSection />
            <Card>
              <CardHeader>
                <CardTitle>Search tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type a tag and press Enter or comma..."
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ',') && e.currentTarget.value.trim()) {
                        e.preventDefault();
                        const newTag = e.currentTarget.value.trim().replace(/,$/, '');
                        if (newTag && !formData.searchTags.includes(newTag)) {
                          setFormData({
                            searchTags: [...formData.searchTags, newTag]
                          });
                        }
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
                {formData.searchTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.searchTags.map((tag: any, idx: any) => (
                      <Badge 
                        key={`${tag}-${idx}`}
                        variant="secondary"
                        className="flex items-center gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => {
                          const newTags = formData.searchTags.filter((_: any, i: any) => i !== idx);
                          setFormData({ searchTags: newTags });
                        }}
                      >
                        {tag}
                        <span className="h-3 w-3">x</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {signedPreviewUrl || videoUrl ? (
                   <div className="aspect-video bg-black rounded-lg overflow-hidden">
                     <VideoPlayer
                       id={`video-${video.id}`}
                       className="w-full h-full"
                       src={signedPreviewUrl || videoUrl || ""}
                       metadata={{
                         videoId: video.id,
                         videoTitle: video.title,
                         videoDuration: primaryAsset?.durationSeconds || 0,
                         videoStreamType: "on-demand",
                       }}
                     />
                   </div>
                 ) : video?.assets && video.assets.length > 0 ? (
                   <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                     <p className="text-muted-foreground text-sm">Video unavailable - no playback ID yet (still processing)</p>
                   </div>
                 ) : (
                   <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                     <div className="text-center space-y-3">
                       <Upload className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                       <div>
                         <p className="text-sm font-medium">No video file uploaded</p>
                         <p className="text-xs text-muted-foreground mt-1">Click the Replace button to upload a video</p>
                       </div>
                     </div>
                   </div>
                 )}

                <input
                  type="file"
                  ref={replaceVideoRef}
                  className="hidden"
                  accept="video/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleReplaceVideo(e.target.files[0]);
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="flex-1" disabled={isDownloading}>
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {isDownloading ? 'Downloading...' : 'Download video'}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setReplaceDialogOpen(true)}>Replace</Button>
                </div>

                <div className="space-y-2">
                  <Label>Trailer</Label>
                  <Select 
                    value={formData.trailerVideoId} 
                    onValueChange={(val) => setFormData({ trailerVideoId: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a trailer video" />
                    </SelectTrigger>
                    <SelectContent>
                      {videos.filter((v: any) => v.id !== video.id).map((v: any) => (
                        <SelectItem key={v.id} value={v.id}>{v.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <VisibilitySection onSave={handleSave} />
            <AccessSection />
            <AdsSection />
            <SubscriptionSection plans={plans} />
            <RentalPricesSection />
            <PurchasePriceSection />
            <BundlesSection bundles={bundles} />
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this video and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={replaceDialogOpen} onOpenChange={setReplaceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace Video</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the current video and upload a new one. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <input
              type="file"
              id="replace-video-file"
              className="hidden"
              accept="video/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleReplaceVideo(e.target.files[0]);
                }
              }}
            />
            <label htmlFor="replace-video-file">
              <Button 
                variant="outline" 
                className="w-full"
                disabled={isReplacing}
                onClick={() => document.getElementById('replace-video-file')?.click()}
              >
                {isReplacing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Select new video file
                  </>
                )}
              </Button>
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReplacing}>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Download Video</AlertDialogTitle>
            <AlertDialogDescription>
              {downloadStatus?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 flex flex-col items-center justify-center gap-4">
            {isDownloading && (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            )}
            {downloadStatus?.type === 'preparing' && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Static MP4 renditions need to be generated for this video. This is a one-time process that may take a few minutes.
                </p>
              </div>
            )}
            {downloadStatus?.type === 'error' && (
              <div className="text-center text-destructive">
                <p className="text-sm">Please try again later or contact support if the issue persists.</p>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDownloading}>
              {isDownloading ? 'Downloading...' : 'Close'}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setErrorDialogOpen(false)}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Shell>
  );
}
