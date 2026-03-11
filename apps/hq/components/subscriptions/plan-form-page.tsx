"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

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
        }
      } catch (err) {
        console.error("[PlanFormPage] Error fetching plan:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [planId]);

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
        router.push("/subscriptions/plans");
      }
    } catch (err) {
      console.error("[PlanFormPage] Error saving plan:", err);
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
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Let users know what they get in your subscription and the key benefits of this particular plan."
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
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
          <Label htmlFor="price">Price (USD)</Label>
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
          <Button type="submit" disabled={saving}>
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
