"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { cn } from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlanFormPageProps {
  planId?: string;
}

export default function PlanFormPage({ planId }: PlanFormPageProps) {
  const router = useRouter();
  const isEditing = !!planId;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    interval: "month",
    planType: "",
    tier: "",
    maxDevices: "",
    hasAds: false,
    isActive: true,
    position: "0",
  });

  useEffect(() => {
    if (!planId) return;
    const fetchPlan = async () => {
      try {
        const res = await fetch(`/api/subscription-plans/${planId}`);
        if (res.ok) {
          const plan = await res.json();
          setForm({
            name: plan.name || "",
            description: plan.description || "",
            price: plan.priceAmount !== null ? (plan.priceAmount / 100).toFixed(2) : "",
            interval: plan.priceInterval || "month",
            planType: plan.planType || "",
            tier: plan.tier || "",
            maxDevices: plan.maxDevices?.toString() || "",
            hasAds: plan.hasAds || false,
            isActive: plan.isActive ?? true,
            position: plan.position?.toString() || "0",
          });
          if (plan.imageStorageBucket && plan.imageStoragePath) {
            setImageUrl(
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${plan.imageStorageBucket}/${plan.imageStoragePath}`
            );
          }
        }
      } catch (err) {
        console.error("[PlanFormPage] Error fetching plan:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId]);

  const uploadImage = async (targetPlanId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("planId", targetPlanId);

    const res = await fetch("/api/subscription-plans/upload-image", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setImageUrl(data.publicUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isEditing
        ? `/api/subscription-plans/${planId}`
        : "/api/subscription-plans";

      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          price: form.price,
          interval: form.interval,
          planType: form.planType || null,
          tier: form.tier || null,
          maxDevices: form.maxDevices || null,
          hasAds: form.hasAds,
          isActive: form.isActive,
          position: parseInt(form.position) || 0,
        }),
      });

      if (res.ok) {
        const savedPlan = await res.json();

        if (pendingFile) {
          setUploading(true);
          await uploadImage(savedPlan.id, pendingFile);
          setPendingFile(null);
          setPendingPreview(null);
          setUploading(false);
        }

        router.push("/subscriptions/plans");
      }
    } catch (err) {
      console.error("[PlanFormPage] Error saving plan:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (isEditing && planId) {
      setUploading(true);
      uploadImage(planId, file).finally(() => setUploading(false));
    } else {
      setPendingFile(file);
      setPendingPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageUrl(null);
    setPendingFile(null);
    if (pendingPreview) {
      URL.revokeObjectURL(pendingPreview);
      setPendingPreview(null);
    }
  };

  const displayImageUrl = imageUrl || pendingPreview;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/subscriptions/plans")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Subscription Plan" : "New Subscription Plan"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Title</Label>
          <Input
            id="name"
            placeholder="Enter your subscription title"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <p className="text-sm text-muted-foreground">
            Let users know what they get in your subscription and the key benefits of this particular plan.
          </p>
          <RichTextEditor
            value={form.description}
            onChange={(val) => setForm({ ...form, description: val })}
            placeholder="Describe the subscription plan..."
          />
        </div>

        <div className="space-y-2">
          <Label>Image</Label>
          <p className="text-sm text-muted-foreground">
            This will appear next to the subscription and can be used to promote a particular subscription.
          </p>
          <p className="text-xs text-muted-foreground">Recommended resolution: 995x560px</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
            }}
          />

          <div
            className={cn(
              "border-2 border-dashed rounded-lg h-[200px] flex flex-col items-center justify-center text-center gap-2 overflow-hidden relative group transition-all",
              displayImageUrl
                ? "border-transparent"
                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/10 cursor-pointer bg-gray-50/50"
            )}
            onClick={() => !uploading && !displayImageUrl && fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="text-xs text-muted-foreground">Uploading...</span>
              </div>
            ) : displayImageUrl ? (
              <>
                <img
                  src={displayImageUrl}
                  alt="Plan image"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="bg-white text-black"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  >
                    Change image
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="bg-white text-black"
                    onClick={(e) => { e.stopPropagation(); removeImage(); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <ImageIcon className="h-10 w-10 text-gray-300" />
                <Button type="button" variant="link" className="text-primary p-0 h-auto">
                  Upload Image
                </Button>
                <span className="text-xs text-muted-foreground">Click here to upload image</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-semibold">Price</Label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="planType">Plan Type</Label>
            <Select value={form.planType} onValueChange={(v) => setForm({ ...form, planType: v })}>
              <SelectTrigger id="planType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="streams">Streams</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier">Tier</Label>
            <Select value={form.tier} onValueChange={(v) => setForm({ ...form, tier: v })}>
              <SelectTrigger id="tier">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="discounted">Discounted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Label htmlFor="price" className="w-12 text-sm text-muted-foreground">USD</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="interval">Billing Interval</Label>
            <Select value={form.interval} onValueChange={(v) => setForm({ ...form, interval: v })}>
              <SelectTrigger id="interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="day">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxDevices">Max Devices</Label>
            <Input
              id="maxDevices"
              type="number"
              min="1"
              placeholder="e.g. 3"
              value={form.maxDevices}
              onChange={(e) => setForm({ ...form, maxDevices: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Display Position</Label>
          <Input
            id="position"
            type="number"
            min="0"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">Includes Ads</p>
            <p className="text-sm text-muted-foreground">Show ads to subscribers on this plan</p>
          </div>
          <Switch
            checked={form.hasAds}
            onCheckedChange={(v) => setForm({ ...form, hasAds: v })}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">Active</p>
            <p className="text-sm text-muted-foreground">Make this plan visible to users</p>
          </div>
          <Switch
            checked={form.isActive}
            onCheckedChange={(v) => setForm({ ...form, isActive: v })}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={saving || uploading}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Create Plan"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/subscriptions/plans")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
