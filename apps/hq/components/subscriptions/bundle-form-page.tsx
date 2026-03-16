"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface Subsite {
  id: string;
  name: string;
  slug: string;
  monthlyPrice: number | null;
  isActive: boolean;
}

interface BundleFormPageProps {
  bundleId?: string;
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b pb-4">
      <h2 className="text-base font-semibold">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
    </div>
  );
}

export default function BundleFormPage({ bundleId }: BundleFormPageProps) {
  const router = useRouter();
  const isEditing = !!bundleId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subsites, setSubsites] = useState<Subsite[]>([]);
  const [stripeInfo, setStripeInfo] = useState<{
    stripeProductId: string | null;
    stripePriceId: string | null;
  }>({ stripeProductId: null, stripePriceId: null });
  const [overrideOriginalPrice, setOverrideOriginalPrice] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    discountPercent: "",
    baseDevices: "3",
    extraDevicePrice: "0",
    maxTotalDevices: "10",
    withAdsDiscount: "0",
    isActive: true,
    position: "0",
    subsiteIds: [] as string[],
  });

  useEffect(() => {
    const init = async () => {
      try {
        const subsitesRes = await fetch("/api/subsites?all=true");
        if (subsitesRes.ok) {
          setSubsites(await subsitesRes.json());
        }

        if (bundleId) {
          const bundleRes = await fetch(`/api/bundles/${bundleId}`);
          if (bundleRes.ok) {
            const bundle = await bundleRes.json();
            const hasOriginalOverride = bundle.originalPrice !== null &&
              bundle.bundleSubsites?.reduce(
                (sum: number, bs: any) => sum + (bs.subsite?.monthlyPrice || 0), 0
              ) !== bundle.originalPrice;

            setForm({
              name: bundle.name || "",
              description: bundle.description || "",
              price: bundle.priceAmount !== null ? (bundle.priceAmount / 100).toFixed(2) : "",
              originalPrice: bundle.originalPrice !== null ? (bundle.originalPrice / 100).toFixed(2) : "",
              discountPercent: bundle.discountPercent?.toString() || "",
              baseDevices: bundle.baseDevices?.toString() || "3",
              extraDevicePrice: bundle.extraDevicePrice !== null ? (bundle.extraDevicePrice / 100).toFixed(2) : "0",
              maxTotalDevices: bundle.maxTotalDevices?.toString() || "10",
              withAdsDiscount: bundle.withAdsDiscount !== null ? (bundle.withAdsDiscount / 100).toFixed(2) : "0",
              isActive: bundle.isActive ?? true,
              position: bundle.position?.toString() || "0",
              subsiteIds: bundle.bundleSubsites?.map((bs: any) => bs.subsite.id) || [],
            });
            setOverrideOriginalPrice(hasOriginalOverride);
            setStripeInfo({
              stripeProductId: bundle.stripeProductId || null,
              stripePriceId: bundle.stripePriceId || null,
            });
          }
        }
      } catch (err) {
        console.error("[BundleFormPage] Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [bundleId]);

  const selectedSubsites = subsites.filter((s) => form.subsiteIds.includes(s.id));
  const autoOriginalPrice = selectedSubsites.reduce((sum, s) => sum + (s.monthlyPrice || 0), 0);
  const effectiveOriginalPrice = overrideOriginalPrice
    ? (parseFloat(form.originalPrice) * 100 || 0)
    : autoOriginalPrice;

  const toggleSubsite = (id: string) => {
    setForm((prev) => ({
      ...prev,
      subsiteIds: prev.subsiteIds.includes(id)
        ? prev.subsiteIds.filter((sid) => sid !== id)
        : [...prev.subsiteIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const priceInDollars = form.price ? form.price : null;
      const discountPercent = form.discountPercent ? parseInt(form.discountPercent) : null;
      const originalPriceInDollars = overrideOriginalPrice && form.originalPrice
        ? form.originalPrice
        : (autoOriginalPrice / 100).toFixed(2);

      const url = isEditing ? `/api/bundles/${bundleId}` : "/api/bundles";
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          price: priceInDollars,
          originalPrice: originalPriceInDollars,
          discountPercent,
          baseDevices: form.baseDevices,
          extraDevicePrice: form.extraDevicePrice,
          maxTotalDevices: form.maxTotalDevices,
          withAdsDiscount: form.withAdsDiscount,
          isActive: form.isActive,
          position: parseInt(form.position) || 0,
          subsiteIds: form.subsiteIds,
        }),
      });

      if (res.ok) {
        router.push("/subscriptions/bundles");
      }
    } catch (err) {
      console.error("[BundleFormPage] Error saving bundle:", err);
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

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
        <Button variant="ghost" size="icon" onClick={() => router.push("/subscriptions/bundles")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Bundle" : "New Bundle"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <SectionHeader title="Basic Information" description="Name and description shown to subscribers." />

          <div className="space-y-2">
            <Label htmlFor="name">Bundle Name</Label>
            <Input
              id="name"
              placeholder="e.g. Kids Bundle"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this bundle offers"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeader
            title="Channels"
            description="Select the channels included in this bundle. The original price is calculated from the sum of individual channel prices."
          />

          <div className="rounded-lg border divide-y max-h-72 overflow-y-auto">
            {subsites.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">No channels available</p>
            ) : (
              subsites.map((subsite) => (
                <label
                  key={subsite.id}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={form.subsiteIds.includes(subsite.id)}
                    onCheckedChange={() => toggleSubsite(subsite.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm">{subsite.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">/{subsite.slug}</span>
                    {!subsite.isActive && (
                      <span className="text-xs text-muted-foreground ml-2">(inactive)</span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground shrink-0">
                    {subsite.monthlyPrice !== null ? `${formatPrice(subsite.monthlyPrice)}/mo` : "—"}
                  </span>
                </label>
              ))
            )}
          </div>

          {selectedSubsites.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedSubsites.length} channel{selectedSubsites.length !== 1 ? "s" : ""} selected
              {autoOriginalPrice > 0 && ` — individual total: ${formatPrice(autoOriginalPrice)}/mo`}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <SectionHeader title="Pricing" description="Set the bundle price and how it compares to individual subscriptions." />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Bundle Price (USD/mo)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">What subscribers pay monthly.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountPercent">Discount % (display badge)</Label>
              <Input
                id="discountPercent"
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 20"
                value={form.discountPercent}
                onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Shown as "Save X%" badge to users.</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseDevices">Base Devices</Label>
              <Input
                id="baseDevices"
                type="number"
                min="1"
                value={form.baseDevices}
                onChange={(e) => setForm({ ...form, baseDevices: e.target.value })}
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

          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Override Original Price</p>
                <p className="text-xs text-muted-foreground">
                  By default the original price is auto-calculated from selected channels (
                  {autoOriginalPrice > 0 ? formatPrice(autoOriginalPrice) : "no channels selected"}
                  ). Enable to set it manually.
                </p>
              </div>
              <Switch
                checked={overrideOriginalPrice}
                onCheckedChange={setOverrideOriginalPrice}
              />
            </div>

            {overrideOriginalPrice && (
              <div className="space-y-2 pt-1">
                <Label htmlFor="originalPrice">Original Price (USD/mo)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={autoOriginalPrice > 0 ? (autoOriginalPrice / 100).toFixed(2) : "0.00"}
                  value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Shown as a crossed-out price to highlight savings vs. the bundle price.
                </p>
              </div>
            )}

            {!overrideOriginalPrice && effectiveOriginalPrice > 0 && form.price && (
              <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
                Savings shown to users: {formatPrice(effectiveOriginalPrice)} → $
                {parseFloat(form.price).toFixed(2)}/mo{" "}
                {parseFloat(form.price) < effectiveOriginalPrice / 100 && (
                  <span className="text-green-600 font-medium">
                    (save {formatPrice(effectiveOriginalPrice - Math.round(parseFloat(form.price) * 100))})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeader title="Availability" description="Control display order and visibility." />

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
            <p className="text-xs text-muted-foreground">Lower numbers appear first in the bundles list.</p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Active</p>
              <p className="text-sm text-muted-foreground">Make this bundle visible to users in checkout.</p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setForm({ ...form, isActive: v })}
            />
          </div>
        </div>

        {isEditing && (stripeInfo.stripeProductId || stripeInfo.stripePriceId) && (
          <div className="space-y-4">
            <SectionHeader title="Stripe" description="Read-only Stripe identifiers for this bundle." />
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
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Create Bundle"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/subscriptions/bundles")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
