"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
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

export default function BundleFormPage({ bundleId }: BundleFormPageProps) {
  const router = useRouter();
  const isEditing = !!bundleId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subsites, setSubsites] = useState<Subsite[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discountPercent: "",
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
            setForm({
              name: bundle.name || "",
              description: bundle.description || "",
              price: bundle.price !== null ? (bundle.price / 100).toFixed(2) : "",
              discountPercent: bundle.discountPercent?.toString() || "",
              isActive: bundle.isActive ?? true,
              position: bundle.position?.toString() || "0",
              subsiteIds: bundle.bundleSubsites?.map((bs: any) => bs.subsite.id) || [],
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
  const originalPrice = selectedSubsites.reduce((sum, s) => sum + (s.monthlyPrice || 0), 0);

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
      const priceInCents = form.price ? Math.round(parseFloat(form.price) * 100) : null;
      const discountPercent = form.discountPercent ? parseInt(form.discountPercent) : null;

      const url = isEditing ? `/api/bundles/${bundleId}` : "/api/bundles";
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          price: form.price || null,
          originalPrice: originalPrice || null,
          discountPercent,
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
        <Button variant="ghost" size="icon" onClick={() => router.push("/subscriptions/bundles")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Bundle" : "New Bundle"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="space-y-3">
          <Label>Channels</Label>
          <p className="text-sm text-muted-foreground">Select the channels included in this bundle</p>
          <div className="rounded-lg border divide-y max-h-64 overflow-y-auto">
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
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {subsite.monthlyPrice !== null ? `$${(subsite.monthlyPrice / 100).toFixed(2)}/mo` : "-"}
                  </span>
                </label>
              ))
            )}
          </div>
          {selectedSubsites.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedSubsites.length} channel{selectedSubsites.length !== 1 ? "s" : ""} selected
              {originalPrice > 0 && ` — individual total: $${(originalPrice / 100).toFixed(2)}/mo`}
            </p>
          )}
        </div>

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountPercent">Discount %</Label>
            <Input
              id="discountPercent"
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 20"
              value={form.discountPercent}
              onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
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
            <p className="font-medium">Active</p>
            <p className="text-sm text-muted-foreground">Make this bundle visible to users</p>
          </div>
          <Switch
            checked={form.isActive}
            onCheckedChange={(v) => setForm({ ...form, isActive: v })}
          />
        </div>

        <div className="flex gap-3 pt-4">
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
