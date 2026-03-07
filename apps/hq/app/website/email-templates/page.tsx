"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Upload, Image as ImageIcon, Film, X } from "lucide-react";

interface MediaAsset {
  id: string;
  name: string;
  type: "image" | "video";
  url: string;
  size: string;
  uploadedAt: Date;
}

export default function MediaSettingsPage() {
  const [assets, setAssets] = React.useState<MediaAsset[]>([
    { id: "1", name: "hero-background.jpg", type: "image", url: "", size: "2.4 MB", uploadedAt: new Date() },
    { id: "2", name: "promo-video.mp4", type: "video", url: "", size: "15.8 MB", uploadedAt: new Date() },
  ]);

  const handleDelete = (id: string) => {
    setAssets(assets.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media"
        description="Manage your channel's media assets"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Upload Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Static Background Image</label>
                <div className="mt-2 border-2 border-dashed border-border/60 rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Video Background</label>
                <div className="mt-2 border-2 border-dashed border-border/60 rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Upload loop video (10s/3s)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MP4 up to 50MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle>Media Library</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/60 hover:bg-muted/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {asset.type === "image" ? (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Film className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">{asset.size}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(asset.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 bg-white">
            <CardHeader>
              <CardTitle>Usage Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p><strong>Images:</strong> PNG or JPG, max 10MB</p>
              <p><strong>Videos:</strong> MP4 format, 10-30 seconds, max 50MB</p>
              <p><strong>Aspect Ratio:</strong> 16:9 recommended for backgrounds</p>
              <p><strong>Resolution:</strong> 1920x1080 minimum for HD displays</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
