"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader, Save, Download, ExternalLink, Upload } from "lucide-react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVideo, useUpdateVideo } from "@/hooks/use-videos";
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
import { useVideoFormStore } from "@/stores/video-form-store";

export default function VideoEditPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const { video, loading, error, refetch } = useVideo(videoId);
  const { updateVideo, loading: saving } = useUpdateVideo(videoId);

  const formData = useVideoFormStore((state) => state.formData);
  const initializeForm = useVideoFormStore((state) => state.initializeForm);
  const setFormData = useVideoFormStore((state) => state.setFormData);
  const setImageUrls = useVideoFormStore((state) => state.setImageUrls);
  const imageUrls = useVideoFormStore((state) => state.imageUrls);
  
  const setDeleteDialogOpen = useVideoFormStore((state) => state.setDeleteDialogOpen);
  const setReplaceDialogOpen = useVideoFormStore((state) => state.setReplaceDialogOpen);
  const setErrorDialogOpen = useVideoFormStore((state) => state.setErrorDialogOpen);
  const setErrorMessage = useVideoFormStore((state) => state.setErrorMessage);
  const setThumbnailUploading = useVideoFormStore((state) => state.setThumbnailUploading);
  
  const deleteDialogOpen = useVideoFormStore((state) => state.deleteDialogOpen);
  const replaceDialogOpen = useVideoFormStore((state) => state.replaceDialogOpen);
  const errorDialogOpen = useVideoFormStore((state) => state.errorDialogOpen);
  const errorMessage = useVideoFormStore((state) => state.errorMessage);

  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isReplacing, setIsReplacing] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<number>();
  const [signedPreviewUrl, setSignedPreviewUrl] = React.useState<string | null>(null);

  const initializedRef = React.useRef(false);
  const horizontalThumbnailRef = React.useRef<HTMLInputElement>(null);

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
  }, [setImageUrls]);

  React.useEffect(() => {
    initializedRef.current = false;
  }, [videoId]);

  React.useEffect(() => {
    if (video && !initializedRef.current) {
      initializedRef.current = true;
      initializeForm(video);
      // Fallbacks
      setFormData({
        seoKeywords: video.seoKeywords || [],
        seoTitle: video.seoTitle || '',
        seoDescription: video.seoDescription || 'Maor',
      });

      if (video.images && video.images.length > 0) {
        generateSignedUrls(video.images.map((img: any) => ({
          imageType: img.imageType,
          storageBucket: img.storageBucket,
          storagePath: img.storagePath,
        })));
      }
    }
  }, [video, videoId, initializeForm, generateSignedUrls, setFormData]);

  const handleSave = async () => {
    try {
      const currentFormData = useVideoFormStore.getState().formData;
      const cleanSearchTags = currentFormData.searchTags || [];
      const cleanSeoKeywords = currentFormData.seoKeywords || [];

      await updateVideo({
        title: currentFormData.title,
        descriptionRich: currentFormData.descriptionRich,
        searchTags: Array.from(new Set([...cleanSearchTags, ...cleanSeoKeywords])),
        seoKeywords: cleanSeoKeywords,
        seoTitle: currentFormData.seoTitle, // Groups
        seoDescription: currentFormData.seoDescription, // Project Name
        status: currentFormData.status,
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
        headers: { 'Content-Type': 'application/json' },
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

  const handleThumbnailUpload = async (file: File, imageType: 'horizontal' | 'vertical') => {
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
        throw new Error('Failed to upload thumbnail');
      }

      const result = await response.json();
      setFormData({
        images: [
          ...(formData.images || []).filter((img: any) => img.imageType !== imageType),
          { imageType, storageBucket: result.storageBucket, storagePath: result.storagePath }
        ]
      });

      if (result.publicUrl) {
        setImageUrls({ ...imageUrls, [imageType]: result.publicUrl });
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to upload thumbnail.');
      setErrorDialogOpen(true);
    } finally {
      setThumbnailUploading(false);
    }
  };

  const primaryAsset = video?.assets?.find((a: any) => a.isPrimary) || video?.assets?.[0];
  const signedPlaybackId = primaryAsset?.muxPlaybackId || null;
  const videoUrl = signedPlaybackId ? `https://stream.mux.com/${signedPlaybackId}.m3u8` : null;

  React.useEffect(() => {
    if (video && !loading) {
      fetch(`/api/videos/${videoId}/playback-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
        .then(r => r.json())
        .then(data => {
          if (data.playbackUrl) setSignedPreviewUrl(data.playbackUrl);
        })
        .catch(err => console.error('Error fetching admin preview access:', err));
    }
  }, [video, videoId, loading]);

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
        body: JSON.stringify({ videoId, filename: file.name }),
      });

      if (!uploadResponse.ok) throw new Error('Failed to create upload');

      const { url: uploadUrl, id: muxUploadId } = await uploadResponse.json();

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      await new Promise((resolve, reject) => {
        xhr.onload = () => xhr.status === 200 ? resolve(xhr.response) : reject(new Error('Upload failed'));
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
      setErrorMessage('Failed to replace video.');
      setErrorDialogOpen(true);
    } finally {
      setIsReplacing(false);
      setUploadProgress(undefined);
    }
  };

  if (loading) return <Shell><div className="flex items-center justify-center py-10"><Loader className="h-8 w-8 animate-spin text-muted-foreground" /></div></Shell>;
  if (error || !video) return <Shell><div className="text-center py-10 text-red-500">Error loading video</div></Shell>;

  return (
    <Shell>
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">{formData.title || "Untitled Video"}</h1>
            <Badge variant={formData.status === 'published' ? 'default' : 'secondary'}>
              {formData.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setFormData({ status: formData.status === 'published' ? 'unpublished' : 'published' });
              }}
            >
              Set to {formData.status === 'published' ? 'Unpublished' : 'Published'}
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save changes
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Metadata Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={formData.title || ''} onChange={(e) => setFormData({ title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <RichTextEditor value={formData.descriptionRich || ''} onChange={(val) => setFormData({ descriptionRich: val })} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Groups</Label>
                    <Input 
                      placeholder="e.g. Learning, Fun" 
                      value={formData.seoTitle || ''} 
                      onChange={(e) => setFormData({ seoTitle: e.target.value })}
                      title="Using SEO Title field to store Groups"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Project Name</Label>
                    <Input 
                      placeholder="e.g. Maor" 
                      value={formData.seoDescription || ''} 
                      onChange={(e) => setFormData({ seoDescription: e.target.value })}
                      title="Using SEO Description field to store Project Name"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label>Tags</Label>
                  <Input 
                    placeholder="Type a tag and press Enter..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        e.preventDefault();
                        const tag = e.currentTarget.value.trim();
                        const currentKeywords = formData.seoKeywords || [];
                        if (!currentKeywords.includes(tag)) {
                          setFormData({ seoKeywords: [...currentKeywords, tag] });
                        }
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  {(formData.seoKeywords || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.seoKeywords.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => {
                          setFormData({ seoKeywords: formData.seoKeywords.filter((_: any, i: number) => i !== idx) });
                        }}>
                          {tag} <span className="ml-1">×</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Video Player</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 {signedPreviewUrl || videoUrl ? (
                   <div className="aspect-video bg-black rounded-lg overflow-hidden">
                     <VideoPlayer id={`video-${video?.id || 'new'}`} className="w-full h-full" src={signedPreviewUrl || videoUrl || ""} metadata={{ videoId: video?.id || '', videoTitle: formData.title }} />
                   </div>
                 ) : (
                   <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                     <Upload className="h-8 w-8 mb-2 opacity-50" />
                     <p className="text-sm">No valid playback ID.</p>
                   </div>
                 )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setReplaceDialogOpen(true)}>Replace</Button>
                  <Button variant="destructive" className="flex-1" onClick={() => setDeleteDialogOpen(true)}>Delete</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Thumbnail</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <input type="file" ref={horizontalThumbnailRef} className="hidden" accept="image/*" onChange={(e) => e.target.files && handleThumbnailUpload(e.target.files[0], 'horizontal')} />
                <div className="space-y-2">
                  <Label>Thumbnail (16:9)</Label>
                  <div 
                    className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer overflow-hidden relative"
                    onClick={() => horizontalThumbnailRef.current?.click()}
                  >
                    {imageUrls.horizontal ? (
                      <img src={imageUrls.horizontal} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm text-muted-foreground">Click to upload</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Video?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={replaceDialogOpen} onOpenChange={setReplaceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace Video</AlertDialogTitle>
            <AlertDialogDescription>Select a new video file to upload.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2 text-center text-sm font-medium">
             {isReplacing && uploadProgress !== undefined && `Uploading: ${uploadProgress}%`}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReplacing}>Cancel</AlertDialogCancel>
            <Button disabled={isReplacing} onClick={() => document.getElementById('replace-video-file')?.click()}>
              Choose File
            </Button>
            <input type="file" id="replace-video-file" className="hidden" accept="video/*" onChange={(e) => e.target.files && handleReplaceVideo(e.target.files[0])} />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Shell>
  );
}
