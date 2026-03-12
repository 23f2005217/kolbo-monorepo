"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Globe,
} from "lucide-react";
import { DataContainer } from "@/components/data/data-container";
import {
  useSubsitesAdmin,
  useCreateSubsite,
  useUpdateSubsite,
  useDeleteSubsite,
  type SubsiteAdmin,
} from "@/hooks/use-subsites-admin";

function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

interface SubsiteFormData {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  monthlyPrice: string;
  fiveDevicesAddonPrice: string;
  withAdsDiscount: string;
}

const initialForm: SubsiteFormData = {
  name: "",
  slug: "",
  description: "",
  isActive: true,
  monthlyPrice: "",
  fiveDevicesAddonPrice: "",
  withAdsDiscount: "",
};

interface SubsiteEditDialogProps {
  subsite: SubsiteAdmin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: SubsiteFormData) => Promise<void>;
}

function SubsiteEditDialog({
  subsite,
  open,
  onOpenChange,
  onSave,
}: SubsiteEditDialogProps) {
  const [form, setForm] = React.useState<SubsiteFormData>(initialForm);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [thumbnailUrl, setThumbnailUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      if (subsite) {
        setForm({
          name: subsite.name,
          slug: subsite.slug,
          description: subsite.description ?? "",
          isActive: subsite.isActive,
          monthlyPrice: subsite.monthlyPrice != null ? String(subsite.monthlyPrice) : "",
          fiveDevicesAddonPrice: subsite.fiveDevicesAddonPrice != null ? String(subsite.fiveDevicesAddonPrice) : "",
          withAdsDiscount: subsite.withAdsDiscount != null ? String(subsite.withAdsDiscount) : "",
        });
        setSlugTouched(true);
        if (subsite.thumbnailUrl) {
          setThumbnailUrl(subsite.thumbnailUrl);
        } else if (subsite.thumbnailStorageBucket && subsite.thumbnailStoragePath) {
          setThumbnailUrl(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${subsite.thumbnailStorageBucket}/${subsite.thumbnailStoragePath}`
          );
        } else {
          setThumbnailUrl(null);
        }
      } else {
        setForm(initialForm);
        setSlugTouched(false);
        setThumbnailUrl(null);
      }
    }
  }, [subsite, open]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      ...(slugTouched ? {} : { slug: slugFromName(name) }),
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !subsite) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subsiteId", subsite.id);

    try {
      const res = await fetch("/api/subsites/upload-thumbnail", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setThumbnailUrl(data.publicUrl);
      } else {
        console.error("Failed to upload thumbnail");
      }
    } catch (err) {
      console.error("Error uploading thumbnail:", err);
    } finally {
      setUploading(false);
    }
  };

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
          <DialogTitle>
            {subsite ? "Edit Subsite" : "Create Subsite"}
          </DialogTitle>
          <DialogDescription>
            {subsite
              ? "Update channel (subsite) name, slug, thumbnail, and visibility."
              : "Add a new channel (subsite) for organizing content."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={handleNameChange}
              placeholder="e.g. Main Channel"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={handleSlugChange}
              placeholder="e.g. main-channel"
              required
            />
            <p className="text-xs text-muted-foreground">
              URL-friendly identifier; auto-generated from name if left blank.
            </p>
          </div>
          
          {subsite && (
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <div className="flex items-center gap-4">
                <div 
                  className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md border bg-muted cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {thumbnailUrl ? (
                    <img 
                      src={thumbnailUrl} 
                      alt="Thumbnail" 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Plus className="h-6 w-6" />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    Change Thumbnail
                  </Button>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Recommended: 1920x1080px (16:9)
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Short description of this channel"
              rows={2}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="isActive">Active</Label>
              <p className="text-xs text-muted-foreground">
                Inactive subsites are hidden from selection and frontend.
              </p>
            </div>
            <Switch
              id="isActive"
              checked={form.isActive}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, isActive: checked }))
              }
            />
          </div>

          <div className="space-y-1 pt-2">
            <p className="text-sm font-medium">Channel Pricing</p>
            <p className="text-xs text-muted-foreground mb-3">
              Configure per-channel pricing with device and ad modifiers.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="monthlyPrice">Base Monthly Price (cents)</Label>
                <Input
                  id="monthlyPrice"
                  type="number"
                  min="0"
                  value={form.monthlyPrice}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, monthlyPrice: e.target.value }))
                  }
                  placeholder="e.g. 1299"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fiveDevicesAddonPrice">5 Devices Addon (cents)</Label>
                <Input
                  id="fiveDevicesAddonPrice"
                  type="number"
                  min="0"
                  value={form.fiveDevicesAddonPrice}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, fiveDevicesAddonPrice: e.target.value }))
                  }
                  placeholder="e.g. 600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="withAdsDiscount">With Ads Discount (cents)</Label>
                <Input
                  id="withAdsDiscount"
                  type="number"
                  min="0"
                  value={form.withAdsDiscount}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, withAdsDiscount: e.target.value }))
                  }
                  placeholder="e.g. 300"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {subsite ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function SubsitesManagementPage() {
  const { subsites, loading, error, refetch } = useSubsitesAdmin();
  const { createSubsite, loading: creating } = useCreateSubsite();
  const { updateSubsite, loading: updating } = useUpdateSubsite();
  const { deleteSubsite, loading: deleting } = useDeleteSubsite();

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingSubsite, setEditingSubsite] = React.useState<SubsiteAdmin | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<SubsiteAdmin | null>(null);

  const handleCreate = () => {
    setEditingSubsite(null);
    setDialogOpen(true);
  };

  const handleEdit = (subsite: SubsiteAdmin) => {
    setEditingSubsite(subsite);
    setDialogOpen(true);
  };

  const handleSave = async (data: SubsiteFormData) => {
    const payload = {
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      description: data.description.trim() || undefined,
      isActive: data.isActive,
    };
    if (editingSubsite) {
      await updateSubsite(editingSubsite.id, payload);
    } else {
      await createSubsite(payload);
    }
    refetch();
  };

  const handleDeleteClick = (subsite: SubsiteAdmin) => {
    setDeleteTarget(subsite);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteSubsite(deleteTarget.id);
    setDeleteTarget(null);
    refetch();
  };

  const isBusy = creating || updating || deleting;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subsite Management"
        description="Create and manage channels (subsites) for organizing content. These appear in upload and organize flows."
        actions={
          <Button onClick={handleCreate} disabled={isBusy}>
            <Plus className="mr-2 h-4 w-4" />
            Create Subsite
          </Button>
        }
      />

      <DataContainer
        title="Subsites"
        loading={loading}
        error={error}
        empty={subsites.length === 0}
        emptyMessage="No subsites yet. Create one to get started."
        onRetry={refetch}
      >
        {subsites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subsites.map((subsite) => (
                    <TableRow key={subsite.id}>
                      <TableCell className="font-medium">
                        {subsite.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {subsite.slug}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {subsite.description || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={subsite.isActive ? "default" : "secondary"}
                        >
                          {subsite.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(subsite)}
                            disabled={isBusy}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(subsite)}
                            disabled={isBusy}
                            title="Delete (deactivate)"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </DataContainer>

      <SubsiteEditDialog
        subsite={editingSubsite}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate subsite?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  &quot;{deleteTarget.name}&quot; will be marked inactive and
                  hidden from selection. Existing videos will keep their
                  assignment. You can reactivate it later by editing.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Deactivate"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
