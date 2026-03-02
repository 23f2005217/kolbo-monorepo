"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Save, 
  MoreHorizontal, 
  Video, 
  Users, 
  Radio, 
  Image as ImageIcon,
  ChevronRight,
  Plus,
  Loader2,
  Upload,
  X
} from "lucide-react";
import { useLiveStream, useUpdateLiveStream } from "@/hooks/use-live-streams";
import { useCategories } from "@/hooks/use-categories";
import { cn } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { LiveStudio } from "./live-studio";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

export function EditStreamPage() {
  const { id } = useParams();
  const router = useRouter();
  const { liveStream, loading: loadingStream, refetch } = useLiveStream(id as string);
  const { updateLiveStream, loading: updating } = useUpdateLiveStream(id as string);
  const { categories } = useCategories();

  const [formData, setFormData] = React.useState<any>(null);
  const [isStudioOpen, setIsStudioOpen] = React.useState(false);
  const [thumbnailUploading, setThumbnailUploading] = React.useState(false);
  const [signedThumbnailUrl, setSignedThumbnailUrl] = React.useState<string | null>(null);
  const thumbnailInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (liveStream) {
      setFormData({
        title: liveStream.title || "",
        descriptionRich: liveStream.descriptionRich || "",
        shortDescription: liveStream.shortDescription || "",
        status: liveStream.status || "unpublished",
        isFree: liveStream.isFree ?? true,
        chatEnabled: liveStream.chatEnabled ?? true,
        remindersEnabled: liveStream.remindersEnabled ?? true,
        donationsEnabled: liveStream.donationsEnabled ?? false,
        rewindEnabled: liveStream.rewindEnabled ?? true,
        preregEnabled: liveStream.preregEnabled ?? false,
        scheduledStartAt: liveStream.scheduledStartAt ? liveStream.scheduledStartAt.split('T')[0] : "",
        scheduledStartTime: liveStream.scheduledStartAt ? new Date(liveStream.scheduledStartAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }) : "",
        sourceType: liveStream.sourceType || "mux_rtmp",
        zoomUrl: liveStream.zoomUrl || "",
        categoryId: liveStream.categoryId || "",
      });

      if (liveStream.thumbnailStorageBucket && liveStream.thumbnailStoragePath) {
        fetchSignedUrl(liveStream.thumbnailStorageBucket, liveStream.thumbnailStoragePath);
      }
    }
  }, [liveStream]);

  const fetchSignedUrl = async (bucket: string, path: string) => {
    try {
      const res = await fetch('/api/live-streams/get-signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket, path }),
      });
      if (res.ok) {
        const data = await res.json();
        setSignedThumbnailUrl(data.signedUrl);
      }
    } catch (err) {
      console.error("Failed to fetch signed URL:", err);
    }
  };

  const handleThumbnailUpload = async (file: File) => {
    if (!file) return;
    setThumbnailUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('streamId', id as string);

      const res = await fetch('/api/live-streams/upload-thumbnail', {
        method: 'POST',
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        setSignedThumbnailUrl(data.publicUrl);
        // Optionally refetch but we already have the URL
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setThumbnailUploading(false);
    }
  };

  if (loadingStream || !formData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSave = async () => {
    const scheduledStartAt = formData.scheduledStartAt && formData.scheduledStartTime
      ? new Date(`${formData.scheduledStartAt}T${formData.scheduledStartTime}`).toISOString()
      : null;

    try {
      await updateLiveStream({
        ...formData,
        scheduledStartAt,
        categoryId: formData.categoryId === "none" ? null : formData.categoryId,
      });
      refetch();
    } catch (error) {
      console.error("Failed to update stream:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {isStudioOpen && (
        <LiveStudio 
          streamKey={liveStream?.muxStreamKey} 
          onClose={() => setIsStudioOpen(false)} 
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/content/live")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Content</span>
            <ChevronRight className="h-4 w-4" />
            <span>Live events</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Edit live event</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-green-600 font-medium mr-4 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-600" />
            All changes saved!
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={updating} className="bg-blue-600 hover:bg-blue-700">
            {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save changes
          </Button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-8">
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-2xl font-bold">{formData.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">About</h3>
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Live stream title</Label>
                    <Input 
                      value={formData.title} 
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter title"
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Descriptions Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Descriptions</h3>
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Description</Label>
                    <RichTextEditor 
                      value={formData.descriptionRich} 
                      onChange={(val: string) => setFormData({ ...formData, descriptionRich: val })}
                      placeholder="This description should explain to the viewer what to expect..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Short description</Label>
                    <Textarea 
                      value={formData.shortDescription} 
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      placeholder="Displayed above the Get Access button..."
                      maxLength={140}
                    />
                    <div className="text-xs text-right text-muted-foreground">
                      Characters left: {140 - (formData.shortDescription?.length || 0)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Organize Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Organize
                <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
              </h3>
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium italic">Category</Label>
                    <Select 
                      value={formData.categoryId || "none"} 
                      onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Category</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Thumbnails Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Thumbnails</h3>
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Horizontal thumbnail (1400×840px)</Label>
                    <p className="text-xs text-muted-foreground italic">Appears as a thumbnail on your catalog page</p>
                    
                    <input 
                      type="file" 
                      ref={thumbnailInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleThumbnailUpload(e.target.files[0]);
                      }}
                    />

                    <div 
                      className={cn(
                        "border-2 border-dashed border-gray-200 rounded-lg h-[240px] flex flex-col items-center justify-center text-center gap-2 bg-gray-50/50 overflow-hidden relative group transition-all",
                        !signedThumbnailUrl && "hover:border-blue-300 hover:bg-blue-50/10 cursor-pointer"
                      )}
                      onClick={() => !thumbnailUploading && thumbnailInputRef.current?.click()}
                    >
                      {thumbnailUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                          <span className="text-xs text-muted-foreground">Uploading thumbnail...</span>
                        </div>
                      ) : signedThumbnailUrl ? (
                        <>
                          <img 
                            src={signedThumbnailUrl} 
                            alt="Stream thumbnail" 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                            <Button variant="secondary" size="sm" className="bg-white text-black">
                              Change image
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-10 w-10 text-gray-300" />
                          <Button variant="link" className="text-primary p-0 h-auto">Upload image</Button>
                          <span className="text-xs text-muted-foreground">Click here to upload image</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Live Studio / RTMP Block */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Stream Source</h3>
              <Card className="border-border/60">
                <CardContent className="p-6 flex flex-col items-center gap-4">
                  {formData.sourceType === "browser" ? (
                    <>
                      <div className="w-24 h-12 bg-gray-100 rounded-lg flex items-center justify-center gap-3">
                        <Users className="h-5 w-5 text-gray-400" />
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                        <Video className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="text-xs text-muted-foreground text-center italic">
                        When you're ready, you can stream from your browser with Live Studio.
                      </p>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => setIsStudioOpen(true)}
                      >
                        <Radio className="h-4 w-4 mr-2" /> Enter Live Studio
                      </Button>
                    </>
                  ) : formData.sourceType === "mux_rtmp" ? (
                    <div className="w-full space-y-4">
                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2">RTMP Connection</p>
                        <div className="space-y-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-blue-600 font-medium">Server URL</span>
                            <span className="text-xs font-mono truncate">{liveStream?.muxRtmpUrl || "rtmps://global-live.mux.com:443/app"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-blue-600 font-medium">Stream Key</span>
                            <span className="text-xs font-mono truncate">{liveStream?.muxStreamKey || "••••••••••••••••"}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground text-center">Use these settings in OBS or other stream software.</p>
                    </div>
                  ) : (
                    <div className="w-full space-y-4">
                       <Label className="text-xs">Zoom Meeting URL</Label>
                       <Input 
                        value={formData.zoomUrl} 
                        onChange={(e) => setFormData({ ...formData, zoomUrl: e.target.value })}
                        placeholder="https://zoom.us/j/..."
                       />
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Visibility Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Visibility</h3>
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <RadioGroup 
                    value={formData.status === "published" || formData.status === "scheduled" ? "published" : "unpublished"}
                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                    className="space-y-4"
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="unpublished" id="v-unpublished" className="mt-1" />
                      <div className="grid gap-1">
                        <Label htmlFor="v-unpublished" className="font-medium">Unpublished</Label>
                        <p className="text-xs text-muted-foreground italic">
                          Not visible in your catalog, your members cannot preregister
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="published" id="v-published" className="mt-1" />
                      <div className="grid gap-1">
                        <Label htmlFor="v-published" className="font-medium">Published</Label>
                        <p className="text-xs text-muted-foreground italic">
                          Visible in your catalog, your members are able to preregister
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </section>

            {/* Preregistration Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Preregistration
                <div className="px-1.5 py-0.5 rounded bg-blue-100 text-[10px] font-bold text-blue-600">PRO</div>
              </h3>
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-bold">0</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <Label htmlFor="prereg-enabled" className="text-sm">Enable Preregistration</Label>
                    <Switch 
                      id="prereg-enabled"
                      checked={formData.preregEnabled}
                      onCheckedChange={(val) => setFormData({ ...formData, preregEnabled: val })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Start date and time</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        type="date" 
                        value={formData.scheduledStartAt}
                        onChange={(e) => setFormData({ ...formData, scheduledStartAt: e.target.value })}
                      />
                      <Input 
                        type="time" 
                        value={formData.scheduledStartTime}
                        onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Access Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Access
                <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
              </h3>
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <RadioGroup 
                    value={formData.isFree ? "free" : "gated"}
                    onValueChange={(val) => setFormData({ ...formData, isFree: val === "free" })}
                    className="space-y-4"
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="gated" id="a-gated" className="mt-1" />
                      <div className="grid gap-1">
                        <Label htmlFor="a-gated" className="font-medium">Gated</Label>
                        <p className="text-xs text-muted-foreground italic">
                          Only users with access will be able to watch this content
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="free" id="a-free" className="mt-1" />
                      <div className="grid gap-1">
                        <Label htmlFor="a-free" className="font-medium">Free for all users</Label>
                        <p className="text-xs text-muted-foreground italic">
                          All users will be able to watch this content, including users that are not logged in
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </section>

            {/* Player options */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">Player options</h3>
              <Card className="border-border/60">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="opt-chat" className="text-sm">Enable live chat</Label>
                      <div className="h-4 w-4 rounded-full border border-muted-foreground flex items-center justify-center text-[10px] text-muted-foreground cursor-help">?</div>
                    </div>
                    <Switch 
                      id="opt-chat" 
                      checked={formData.chatEnabled} 
                      onCheckedChange={(val) => setFormData({ ...formData, chatEnabled: val })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="opt-donations" className="text-sm">Enable donations</Label>
                      <div className="h-4 w-4 rounded-full border border-muted-foreground flex items-center justify-center text-[10px] text-muted-foreground cursor-help">?</div>
                    </div>
                    <Switch 
                      id="opt-donations" 
                      checked={formData.donationsEnabled} 
                      onCheckedChange={(val) => setFormData({ ...formData, donationsEnabled: val })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="opt-rewind" className="text-sm">Enable rewind</Label>
                      <div className="h-4 w-4 rounded-full border border-muted-foreground flex items-center justify-center text-[10px] text-muted-foreground cursor-help">?</div>
                    </div>
                    <Switch 
                      id="opt-rewind" 
                      checked={formData.rewindEnabled} 
                      onCheckedChange={(val) => setFormData({ ...formData, rewindEnabled: val })}
                    />
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
