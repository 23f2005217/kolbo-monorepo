"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileVideo, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/utils";

interface UploadStatus {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  videoId?: string;
  uploadUrl?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('video/'));
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('video/'));
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    const newUploads: UploadStatus[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending',
    }));

    setUploads(prev => [...prev, ...newUploads]);

    for (const upload of newUploads) {
      await startUpload(upload);
    }
  };

  const startUpload = async (upload: UploadStatus) => {
    try {
      setUploads(prev => prev.map(u => 
        u.file === upload.file ? { ...u, status: 'uploading' } : u
      ));

      // Step 1: Get upload URL from backend
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: upload.file.name }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, videoId } = await response.json();

      setUploads(prev => prev.map(u => 
        u.file === upload.file ? { ...u, videoId, uploadUrl } : u
      ));

      // Step 2: Upload to Mux
      await uploadToMux(upload, uploadUrl);

      setUploads(prev => prev.map(u => 
        u.file === upload.file ? { ...u, status: 'processing' } : u
      ));

      // Step 3: Poll for processing status
      await pollProcessingStatus(upload, videoId);

      setUploads(prev => prev.map(u => 
        u.file === upload.file ? { ...u, status: 'complete', progress: 100 } : u
      ));

    } catch (error: any) {
      setUploads(prev => prev.map(u => 
        u.file === upload.file ? { ...u, status: 'error', error: error.message } : u
      ));
    }
  };

  const uploadToMux = async (upload: UploadStatus, uploadUrl: string) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 90);
          setUploads(prev => prev.map(u => 
            u.file === upload.file ? { ...u, progress } : u
          ));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', upload.file.type);
      xhr.send(upload.file);
    });
  };

  const pollProcessingStatus = async (upload: UploadStatus, videoId: string) => {
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`/api/videos/${videoId}`);
      if (response.ok) {
        const video = await response.json();
        const primaryAsset = video.assets?.find((a: any) => a.isPrimary) || video.assets?.[0];
        
        if (primaryAsset?.status === 'ready') {
          return;
        }
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    throw new Error('Processing timeout');
  };

  const removeUpload = (upload: UploadStatus) => {
    setUploads(prev => prev.filter(u => u.file !== upload.file));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const allComplete = uploads.length > 0 && uploads.every(u => u.status === 'complete');

  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Upload Videos</h1>
          <Button variant="outline" onClick={() => router.push('/')}>
            Back to Videos
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload New Videos</CardTitle>
            <CardDescription>
              Drag and drop video files or click to browse. Videos will be uploaded to MyMaor channel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              )}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Drop video files here</p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse from your computer
              </p>
              <p className="text-xs text-muted-foreground">
                Supports MP4, MOV, AVI, and other video formats
              </p>
              <input
                id="file-input"
                type="file"
                multiple
                accept="video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </CardContent>
        </Card>

        {uploads.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {uploads.map((upload, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <FileVideo className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium truncate">{upload.file.name}</p>
                      <div className="flex items-center gap-2">
                        {upload.status === 'complete' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {upload.status === 'error' && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeUpload(upload)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(upload.file.size)}</span>
                      <span>•</span>
                      <span className={cn(
                        upload.status === 'error' && "text-red-500",
                        upload.status === 'complete' && "text-green-500"
                      )}>
                        {upload.status === 'pending' && 'Waiting...'}
                        {upload.status === 'uploading' && 'Uploading...'}
                        {upload.status === 'processing' && 'Processing...'}
                        {upload.status === 'complete' && 'Complete'}
                        {upload.status === 'error' && upload.error}
                      </span>
                    </div>
                    <Progress value={upload.progress} className="mt-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {allComplete && (
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => setUploads([])}>
              Upload More
            </Button>
            <Button onClick={() => router.push(`/${uploads[0].videoId}`)}>
              Edit First Video
            </Button>
          </div>
        )}
      </div>
    </Shell>
  );
}
