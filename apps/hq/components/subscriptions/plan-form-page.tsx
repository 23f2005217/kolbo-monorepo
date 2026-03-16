"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Image as ImageIcon, X, ExternalLink } from "lucide-react";
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

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b pb-4">
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
    </div>
  );
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
  const [stripeInfo, setStripeInfo] = useState<{
    stripeProductId: string | null;
    stripePriceId: string | null;
  }>({ stripeProductId: null, stripePriceId: null });

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    interval: "month",
    planType: "",
    tier: "",
    maxDevices: "3",
    hasAds: false,
    extraDevicePrice: "0",
    maxTotalDevices: "10",
    withAdsDiscount: "0",
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
            maxDevices: plan.maxDevices?.toString() || "3",
            hasAds: plan.hasAds || false,
            extraDevicePrice: plan.extraDevicePrice !== null ? (plan.extraDevicePrice / 100).toFixed(2) : "0",
            maxTotalDevices: plan.maxTotalDevices?.toString() || "10",
            withAdsDiscount: plan.withAdsDiscount !== null ? (plan.withAdsDiscount / 100).toFixed(2) : "0",
            isActive: plan.isActive ?? true,
            position: plan.position?.toString() || "0",
          });
          setStripeInfo({
            stripeProductId: plan.stripeProductId || null,
            stripePriceId: plan.stripePriceId || null,
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
      const url = isEditing ? `/api/subscription-plans/${planId}` : "/api/subscription-plans";
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
          extraDevicePrice: form.extraDevicePrice,
          maxTotalDevices: form.maxTotalDevices,
          withAdsDiscount: form.withAdsDiscount,
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
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/subscriptions/plans")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Subscription Plan" : "New Subscription Plan"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <SectionHeader title="Basic Information" description="Name and description shown to subscribers." />

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
              Let users know what they get and the key benefits of this plan.
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
              Appears next to the subscription. Recommended: 995×560px.
            </p>
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
                  <img src={displayImageUrl} alt="Plan image" className="w-full h-full object-cover" />
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
                  <Button type="button" variant="link" className="text-primary p-0 h-auto">Upload Image</Button>
                  <span className="text-xs text-muted-foreground">Click here to upload image</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeader title="Categorization" description="How this plan is classified in the signup flow." />

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
              <p className="text-xs text-muted-foreground">Groups the plan by function in the signup UI.</p>
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
              <p className="text-xs text-muted-foreground">Determines the default selection during signup.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeader title="Pricing" description="How much subscribers are charged and how often." />

          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-10 shrink-0">USD</span>
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
            <p className="text-xs text-muted-foreground">
              Price in US dollars. This is an additive cost on top of channel prices.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxDevices">Base Devices</Label>
              <Input
                id="maxDevices"
                type="number"
                min="1"
                value={form.maxDevices}
                onChange={(e) => setForm({ ...form, maxDevices: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">Devices included in price.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="extraDevicePrice">Price per Extra (USD)</Label>
              <Input
                id="extraDevicePrice"
                type="number"
                step="0.01"
                min="0"
                value={form.extraDevicePrice}
                onChange={(e) => setForm({ ...form, extraDevicePrice: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">Cost for each device above base.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxTotalDevices">Max Total Devices</Label>
              <Input
                id="maxTotalDevices"
                type="number"
                min="1"
                value={form.maxTotalDevices}
                onChange={(e) => setForm({ ...form, maxTotalDevices: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">Absolute limit.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="withAdsDiscount">With Ads Discount (USD/mo)</Label>
              <Input
                id="withAdsDiscount"
                type="number"
                step="0.01"
                min="0"
                value={form.withAdsDiscount}
                onChange={(e) => setForm({ ...form, withAdsDiscount: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Discount if user opts into ads.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Billing Period</Label>
            <p className="text-sm text-muted-foreground">The frequency at which subscribers are charged.</p>
            <Select value={form.interval} onValueChange={(v) => setForm({ ...form, interval: v })}>
              <SelectTrigger id="interval" className="max-w-xs">
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
        </div>

        <div className="space-y-4">
          <SectionHeader title="Profiles / Devices" description="Set the maximum number of simultaneous devices allowed." />

          <div className="space-y-2">
            <Label htmlFor="maxDevices">Max Devices</Label>
            <Input
              id="maxDevices"
              type="number"
              min="1"
              max="20"
              placeholder="e.g. 3"
              className="max-w-xs"
              value={form.maxDevices}
              onChange={(e) => setForm({ ...form, maxDevices: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of devices that can watch simultaneously under this plan.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeader title="Ads" description="Control ad behavior for subscribers on this plan." />

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Includes Ads</p>
              <p className="text-sm text-muted-foreground">Show advertisements to subscribers on this plan.</p>
            </div>
            <Switch
              checked={form.hasAds}
              onCheckedChange={(v) => setForm({ ...form, hasAds: v })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeader title="Availability" description="Control whether this plan is shown publicly in the checkout." />

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Public</p>
              <p className="text-sm text-muted-foreground">
                Active plans are shown in the checkout for all visitors. Inactive plans are hidden.
              </p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setForm({ ...form, isActive: v })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Display Position</Label>
            <Input
              id="position"
              type="number"
              min="0"
              className="max-w-xs"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Lower numbers appear first within the plan type.</p>
          </div>
        </div>

        {isEditing && (stripeInfo.stripeProductId || stripeInfo.stripePriceId) && (
          <div className="space-y-4">
            <SectionHeader title="Stripe" description="Read-only Stripe identifiers for this plan." />
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              {stripeInfo.stripeProductId && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Product ID</Label>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                      {stripeInfo.stripeProductId}
                    </code>
                    <a
                      href={`https://dashboard.stripe.com/products/${stripeInfo.stripeProductId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </a>
                  </div>
                </div>
              )}
              {stripeInfo.stripePriceId && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Price ID</Label>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                      {stripeInfo.stripePriceId}
                    </code>
                    <a
                      href={`https://dashboard.stripe.com/prices/${stripeInfo.stripePriceId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </a>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Stripe products and prices are automatically synced when you save changes.
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
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
