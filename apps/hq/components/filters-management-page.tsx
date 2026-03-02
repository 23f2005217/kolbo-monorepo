"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Tag,
  Search,
} from "lucide-react";
import { cn } from "@/utils";
import { DataContainer } from "@/components/data/data-container";
import { useFilters, Filter, FilterValue, useCreateFilter, useDeleteFilter, useUpdateFilterGeneric, useCreateFilterValue, useUpdateFilterValue, useDeleteFilterValue } from "@/hooks/use-filters";
import { useFiltersStore } from "@/stores/filters-store";

interface FilterValueEditDialogProps {
  filterValue: FilterValue | null;
  filterId: string;
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

function FilterValueEditDialog({ filterValue, filterId, open, onClose, onSave }: FilterValueEditDialogProps) {
  const [formData, setFormData] = React.useState({
    label: "",
    value: "",
    position: 0,
    isActive: true,
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (filterValue) {
      setFormData({
        label: filterValue.label || "",
        value: filterValue.value || "",
        position: filterValue.position || 0,
        isActive: filterValue.isActive ?? true,
      });
    } else {
      setFormData({
        label: "",
        value: "",
        position: 0,
        isActive: true,
      });
    }
  }, [filterValue, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...formData,
        filterId,
      });
      onClose();
    } catch (error) {
      console.error("Error saving filter value:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {filterValue ? "Edit Filter Value" : "Add Filter Value"}
          </DialogTitle>
          <DialogDescription>
            Configure the filter value settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label *</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="Display label"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Value *</Label>
            <Input
              id="value"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="Internal value"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              type="number"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface FilterEditDialogProps {
  filter: Filter | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

function FilterEditDialog({ filter, open, onClose, onSave }: FilterEditDialogProps) {
  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
    position: 0,
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (filter) {
      setFormData({
        name: filter.name || "",
        slug: filter.slug || "",
        description: filter.description || "",
        isActive: filter.isActive ?? true,
        position: filter.position || 0,
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        isActive: true,
        position: 0,
      });
    }
  }, [filter, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving filter:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {filter ? "Edit Filter" : "Add Filter"}
          </DialogTitle>
          <DialogDescription>
            Configure the filter settings. Filters are used to populate search bars and playlist views.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Filter name (e.g., Ages, Types)"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="URL-friendly identifier"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Filter description"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                type="number"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface FilterCardProps {
  filter: Filter;
  onEdit: (filter: Filter) => void;
  onDelete: (id: string) => void;
  onEditValue: (value: FilterValue, filterId: string) => void;
  onAddValue: (filterId: string) => void;
  onDeleteValue: (id: string) => void;
  onMoveValueUp: (filterId: string, index: number) => void;
  onMoveValueDown: (filterId: string, index: number) => void;
}

function FilterCard({ filter, onEdit, onDelete, onEditValue, onAddValue, onDeleteValue, onMoveValueUp, onMoveValueDown }: FilterCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="border-b border-border/60 last:border-b-0">
      <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-700 flex-shrink-0">
            <Tag className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{filter.name}</div>
            {filter.description && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{filter.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={filter.isActive ? "default" : "secondary"} className="text-xs">
            {filter.isActive ? "Active" : "Inactive"}
          </Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(filter)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(filter.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="px-4 py-3 bg-muted/30 border-t border-border/60">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Filter Values ({filter.filterValues.length})</h4>
              <Button size="sm" variant="outline" onClick={() => onAddValue(filter.id)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Value
              </Button>
            </div>
            {filter.filterValues.length === 0 ? (
              <p className="text-sm text-muted-foreground">No values added yet</p>
            ) : (
              <div className="space-y-2">
                {filter.filterValues.map((value, index) => (
                  <div
                    key={value.id}
                    className="flex items-center gap-2 p-3 border rounded-lg bg-white"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col gap-1 items-center justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === 0}
                        onClick={() => onMoveValueUp(filter.id, index)}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === filter.filterValues.length - 1}
                        onClick={() => onMoveValueDown(filter.id, index)}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{value.label}</span>
                        <Badge variant="outline" className="text-xs">{value.value}</Badge>
                      </div>
                    </div>
                    <Badge variant={value.isActive ? "default" : "secondary"} className="text-xs">
                      {value.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEditValue(value, filter.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDeleteValue(value.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FiltersManagementPage() {
  const { filters, loading, error, refetch } = useFilters();
  const { createFilter } = useCreateFilter();
  const { deleteFilter } = useDeleteFilter();
  const { updateFilter } = useUpdateFilterGeneric();
  const { createFilterValue } = useCreateFilterValue();
  const { updateFilterValue } = useUpdateFilterValue();
  const { deleteFilterValue } = useDeleteFilterValue();

  const [editDialog, setEditDialog] = React.useState<{ open: boolean; filter: Filter | null }>({ open: false, filter: null });
  const [valueEditDialog, setValueEditDialog] = React.useState<{ open: boolean; filterValue: FilterValue | null; filterId: string }>({ open: false, filterValue: null, filterId: "" });
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null; type: 'filter' | 'value' }>({ open: false, id: null, type: 'filter' });

  const handleEditFilter = (filter: Filter) => {
    setEditDialog({ open: true, filter });
  };

  const handleSaveFilter = async (data: any) => {
    if (editDialog.filter) {
      await updateFilter({ id: editDialog.filter.id, ...data });
    } else {
      await createFilter(data);
    }
    refetch();
  };

  const handleDeleteClick = (id: string, type: 'filter' | 'value') => {
    setDeleteDialog({ open: true, id, type });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.id) {
      if (deleteDialog.type === 'filter') {
        await deleteFilter(deleteDialog.id);
      } else {
        await deleteFilterValue(deleteDialog.id);
      }
      setDeleteDialog({ open: false, id: null, type: 'filter' });
      refetch();
    }
  };

  const handleEditValue = (filterValue: FilterValue, filterId: string) => {
    setValueEditDialog({ open: true, filterValue, filterId });
  };

  const handleAddValue = (filterId: string) => {
    setValueEditDialog({ open: true, filterValue: null, filterId });
  };

  const handleSaveValue = async (data: any) => {
    if (valueEditDialog.filterValue) {
      await updateFilterValue({ id: valueEditDialog.filterValue.id, ...data });
    } else {
      await createFilterValue(data);
    }
    refetch();
  };

  const handleMoveValueUp = async (filterId: string, index: number) => {
    if (index === 0) return;
    const filter = filters.find(f => f.id === filterId);
    if (!filter) return;

    const values = [...filter.filterValues];
    const fromValue = values[index];
    const toValue = values[index - 1];

    await Promise.all([
      updateFilterValue({ id: fromValue.id, position: toValue.position }),
      updateFilterValue({ id: toValue.id, position: fromValue.position }),
    ]);

    refetch();
  };

  const handleMoveValueDown = async (filterId: string, index: number) => {
    const filter = filters.find(f => f.id === filterId);
    if (!filter || index === filter.filterValues.length - 1) return;

    const values = [...filter.filterValues];
    const fromValue = values[index];
    const toValue = values[index + 1];

    await Promise.all([
      updateFilterValue({ id: fromValue.id, position: toValue.position }),
      updateFilterValue({ id: toValue.id, position: fromValue.position }),
    ]);

    refetch();
  };

  const itemToDelete = deleteDialog.id ? (
    deleteDialog.type === 'filter' 
      ? filters.find(f => f.id === deleteDialog.id)
      : filters.flatMap(f => f.filterValues).find(v => v.id === deleteDialog.id)
  ) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Custom Filters"
        description="Create and manage custom filters for search bars and playlist views."
      />

      <Card className="border-border/60 bg-white overflow-hidden">
        <CardHeader className="border-b border-border/60">
          <div className="flex items-center justify-between">
            <CardTitle>Custom filters</CardTitle>
            <Button onClick={() => setEditDialog({ open: true, filter: null })}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataContainer
            loading={loading}
            error={error}
            empty={!filters.length}
            emptyMessage="No custom filters yet"
          >
            <div className="divide-y divide-border/60">
              {filters.map((filter) => (
                <FilterCard
                  key={filter.id}
                  filter={filter}
                  onEdit={handleEditFilter}
                  onDelete={(id) => handleDeleteClick(id, 'filter')}
                  onEditValue={handleEditValue}
                  onAddValue={handleAddValue}
                  onDeleteValue={(id) => handleDeleteClick(id, 'value')}
                  onMoveValueUp={handleMoveValueUp}
                  onMoveValueDown={handleMoveValueDown}
                />
              ))}
            </div>
          </DataContainer>
        </CardContent>
      </Card>

      <FilterEditDialog
        filter={editDialog.filter}
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, filter: null })}
        onSave={handleSaveFilter}
      />

      <FilterValueEditDialog
        filterValue={valueEditDialog.filterValue}
        filterId={valueEditDialog.filterId}
        open={valueEditDialog.open}
        onClose={() => setValueEditDialog({ open: false, filterValue: null, filterId: "" })}
        onSave={handleSaveValue}
      />

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: deleteDialog.id, type: deleteDialog.type })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteDialog.type === 'filter' ? 'Filter' : 'Filter Value'}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteDialog.type === 'filter' ? 'filter' : 'filter value'}? This action cannot be undone.
              {itemToDelete && (
                <span className="block mt-2 font-medium text-foreground">
                  {deleteDialog.type === 'filter' 
                    ? (itemToDelete as Filter).name 
                    : (itemToDelete as FilterValue).label}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, id: null, type: 'filter' })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
