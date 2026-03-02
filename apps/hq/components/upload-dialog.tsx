"use client";

import { useState, useCallback } from "react";
import { Upload, CheckCircle, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useSubsites } from "@/hooks/use-subsites";

const NONE_SUBSITE_ID = "none";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const router = useRouter();
  const { subsites: apiSubsites, loading: subsitesLoading } = useSubsites();
  const subsites = [
    { id: NONE_SUBSITE_ID, name: "None (Default)" },
    ...apiSubsites.map((s) => ({ id: s.id, name: s.name })),
  ];
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [selectedSubsite, setSelectedSubsite] = useState(NONE_SUBSITE_ID);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("video/")
      );
      setSelectedFiles(files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files).filter((f) =>
        f.type.startsWith("video/")
      );
      setSelectedFiles(files);
    }
  };

  const handleUploadSuccess = () => {
    setUploadStatus("success");
    if (videoId) {
      onOpenChange(false);
      router.push(`/content/videos/${videoId}`);
    } else {
      onOpenChange(false);
      router.push("/content/videos");
    }
  };

  const handleUploadError = () => {
    setUploadStatus("error");
  };

  const handleStart = async () => {
    try {
      setIsLoading(true);
      setUploadStatus("idle");

      const file = selectedFiles[0];

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subsiteId: selectedSubsite === NONE_SUBSITE_ID ? null : selectedSubsite,
          filename: file.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Failed to get upload URL: ${response.status}`);
      }

      const data = await response.json();
      setUploadUrl(data.uploadUrl);
      setVideoId(data.videoId);

      setUploadStatus("uploading");

      const uploadResponse = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      // Poll for asset and playback ID
      const statusResponse = await fetch("/api/upload/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uploadId: data.uploadId,
          videoId: data.videoId,
        }),
      });

      if (!statusResponse.ok) {
        console.warn("Failed to poll upload status, will rely on webhooks");
      }

      handleUploadSuccess();

    } catch (error) {
      console.error("Error during upload process:", error);
      setUploadStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setUploadStatus("idle");
      setSelectedFiles([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        {uploadStatus === "success" ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Upload Complete!</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Your video has been uploaded successfully and is being processed.
            </p>
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle>Upload videos</DialogTitle>
              </DialogHeader>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assign to SubSite</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      disabled={isLoading || subsitesLoading}
                    >
                      {subsitesLoading
                        ? "Loading..."
                        : subsites.find((s) => s.id === selectedSubsite)?.name}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                    {subsites.map((subsite) => (
                      <DropdownMenuItem
                        key={subsite.id}
                        onClick={() => setSelectedSubsite(subsite.id)}
                        className={selectedSubsite === subsite.id ? "bg-muted" : ""}
                      >
                        {selectedSubsite === subsite.id && (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {selectedSubsite !== subsite.id && (
                          <span className="w-4 mr-2" />
                        )}
                        {subsite.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive ? "border-primary bg-primary/5" : "border-gray-300"}
                ${selectedFiles.length > 0 ? "bg-muted/50" : ""}
                `}
              >
                {selectedFiles.length > 0 ? (
                  <div className="space-y-2">
                    <p className="font-medium">
                      {selectedFiles.length} file(s) selected
                    </p>
                    <ul className="text-sm text-muted-foreground">
                      {selectedFiles.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <>
                    <p className="text-muted-foreground mb-4">
                      Drag and drop files here
                    </p>
                    <label>
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button variant="outline" type="button" className="bg-white" asChild>
                        <span>Select files</span>
                      </Button>
                    </label>
                  </>
                )}
              </div>


              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleStart}
                  disabled={isLoading || selectedFiles.length === 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
