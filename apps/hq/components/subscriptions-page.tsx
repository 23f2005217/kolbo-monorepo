"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, Search, Users, Package, TrendingUp, Crown, Loader2, Pencil, Trash2 } from "lucide-react";
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
import { useSubscriptionPlans, type SubscriptionPlan } from "@/hooks/use-subscription-plans";

interface PlanFormData {
  name: string;
  description: string;
  price: string;
  interval: string;
  isActive: boolean;
}

const initialFormData: PlanFormData = {
  name: "",
  description: "",
  price: "",
  interval: "month",
  isActive: true,
};

function PlanCard({
  plan,
  onEdit,
  onDelete
}: {
  plan: SubscriptionPlan;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
}) {
  const priceDisplay = plan.priceAmount != null
    ? (plan.priceAmount / 100).toFixed(2)
    : "0.00";
  const intervalDisplay = plan.priceInterval || "month";

  return (
    <Card className="border-border/60 bg-white">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          <Badge variant={plan.isActive ? "default" : "secondary"}>
            {plan.isActive ? "active" : "inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-3xl font-bold text-primary">
            ${priceDisplay}
            <span className="text-sm font-normal text-muted-foreground">/{intervalDisplay}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {plan.description || "No description"}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span>{plan.isActive ? "Active" : "Inactive"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stripe Product</span>
            <span className="font-mono text-xs">{plan.stripeProductId ? "Connected" : "Not connected"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{new Date(plan.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1" variant="outline" onClick={() => onEdit(plan)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" className="text-destructive hover:bg-destructive hover:bg-destructive/10" onClick={() => onDelete(plan)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface PlanEditDialogProps {
  plan: SubscriptionPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: PlanFormData) => Promise<void>;
}

function PlanEditDialog({ plan, open, onOpenChange, onSave }: PlanEditDialogProps) {
  const [form, setForm] = React.useState<PlanFormData>(initialFormData);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      if (plan) {
        setForm({
          name: plan.name,
          description: plan.description ?? "",
          price: plan.priceAmount != null ? (plan.priceAmount / 100).toString() : "",
          interval: plan.priceInterval || "month",
          isActive: plan.isActive,
        });
      } else {
        setForm(initialFormData);
      }
    }
  }, [plan, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{plan ? "Edit Plan" : "Create Plan"}</DialogTitle>
          <DialogDescription>
            {plan
              ? "Update your subscription plan details. Changes will sync with Stripe."
              : "Create a new subscription plan. This will create a product and price in Stripe."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Monthly Premium"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what's included in this plan"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="9.99"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interval">Billing Interval</Label>
              <Select
                value={form.interval}
                onValueChange={(val) => setForm((prev) => ({ ...prev, interval: val }))}
              >
                <SelectTrigger id="interval">
                  <SelectValue placeholder="Select interval" />
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
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="isActive">Active</Label>
              <p className="text-xs text-muted-foreground">
                Inactive plans are not visible to customers.
              </p>
            </div>
            <Switch
              id="isActive"
              checked={form.isActive}
              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {plan ? "Save Changes" : "Create Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = React.useState("plans");
  const [search, setSearch] = React.useState("");
  const { plans, loading, refetch } = useSubscriptionPlans();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<SubscriptionPlan | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [planToDelete, setPlanToDelete] = React.useState<SubscriptionPlan | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const filteredPlans = plans.filter((plan) =>
    plan.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateClick = () => {
    setEditingPlan(null);
    setDialogOpen(true);
  };

  const handleEditClick = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setDialogOpen(true);
  };

  const handleDeleteClick = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/subscription-plans/${planToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete plan");
      }

      refetch();
    } catch (error) {
      console.error("Error deleting plan:", error);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  };

  const handleSave = async (data: PlanFormData) => {
    const payload = {
      name: data.name.trim(),
      description: data.description.trim() || null,
      price: parseFloat(data.price),
      interval: data.interval,
      isActive: data.isActive,
    };

    const url = editingPlan
      ? `/api/subscription-plans/${editingPlan.id}`
      : "/api/subscription-plans";
    const method = editingPlan ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save plan");
    }

    refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions & Bundles"
        description="Manage subscription plans and bundles"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/60 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Plans</p>
                <p className="text-2xl font-bold">{loading ? "..." : plans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Plans</p>
                <p className="text-2xl font-bold">
                  {loading ? "..." : plans.filter(p => p.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Bundles</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                <Crown className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Plans</p>
                <p className="text-2xl font-bold">{loading ? "..." : plans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="bundles">Bundles</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-4 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <Button onClick={handleCreateClick}>
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === "plans" ? "Create Plan" : "Create Bundle"}
            </Button>
          </div>
        </div>

        <TabsContent value="plans" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPlans.length === 0 ? (
            <Card className="border-border/60 bg-white">
              <CardContent className="py-12 text-center text-muted-foreground">
                {search ? "No plans match your search" : "No subscription plans yet. Create your first plan!"}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} onEdit={handleEditClick} onDelete={handleDeleteClick} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bundles" className="space-y-4">
          <Card className="border-border/60 bg-white">
            <CardContent className="py-12 text-center text-muted-foreground">
              Bundles feature coming soon
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PlanEditDialog
        plan={editingPlan}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscription Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{planToDelete?.name}&quot;? This will also deactivate the product and prices in Stripe. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
