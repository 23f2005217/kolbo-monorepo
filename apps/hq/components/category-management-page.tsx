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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  GripVertical,
  Trash2,
  Edit2,
  Image,
  Type,
  LayoutGrid,
  Film,
  Loader2,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/utils";
import { DataContainer } from "@/components/data/data-container";
import { useCategories, Category, useCreateCategory, useDeleteCategory, useUpdateCategoryGeneric } from "@/hooks/use-categories";
import { useFilters, Filter } from "@/hooks/use-filters";
import { useCategoriesStore, CategoryType } from "@/stores/categories-store";

const typeLabels: Record<string, string> = {
  "hero_banner": "Hero Banner",
  "video_row": "Video Row",
  "large_text_block": "Text Divider",
  "category_card_row": "Channels Row",
  "divider": "Divider",
};

const sectionConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; defaultName: string }
> = {
  "hero_banner": {
    label: "Hero Banner",
    icon: <Image className="h-5 w-5" />,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    defaultName: "Hero Banner",
  },
  "video_row": {
    label: "Video Row",
    icon: <Film className="h-5 w-5" />,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    defaultName: "Video Row",
  },
  "large_text_block": {
    label: "Text Divider",
    icon: <Type className="h-5 w-5" />,
    color: "bg-green-100 text-green-700 border-green-200",
    defaultName: "Text Divider",
  },
  "category_card_row": {
    label: "Channels Row",
    icon: <LayoutGrid className="h-5 w-5" />,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    defaultName: "Channels Row",
  },
  "divider": {
    label: "Divider",
    icon: <GripVertical className="h-5 w-5" />,
    color: "bg-gray-100 text-gray-700 border-gray-200",
    defaultName: "Divider",
  },
};

interface CategoryEditDialogProps {
  category: Category | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  filters: Filter[];
}

function CategoryEditDialog({ category, open, onClose, onSave, filters }: CategoryEditDialogProps) {
  const [formData, setFormData] = React.useState({
    type: "video_row" as CategoryType,
    name: "",
    description: "",
    position: 0,
    isActive: true,
    filterIds: [] as string[],
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (category) {
      setFormData({
        type: category.type as CategoryType,
        name: category.name || "",
        description: category.description || "",
        position: category.position || 0,
        isActive: category.isActive ?? true,
        filterIds: (category.config?.filterIds as string[]) || [],
      });
    } else {
      setFormData({
        type: "video_row",
        name: "",
        description: "",
        position: 0,
        isActive: true,
        filterIds: [],
      });
    }
  }, [category, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...formData,
        config: { filterIds: formData.filterIds },
      });
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (filterId: string) => {
    setFormData(prev => ({
      ...prev,
      filterIds: prev.filterIds.includes(filterId)
        ? prev.filterIds.filter(id => id !== filterId)
        : [...prev.filterIds, filterId],
    }));
  };

  const availableTypes = [
    { type: "hero_banner" as CategoryType, label: "Hero Banner", description: "Creates the large, scrolling banner at the top of the homepage" },
    { type: "video_row" as CategoryType, label: "Category", description: "Creates a standard horizontal row of videos" },
    { type: "category_card_row" as CategoryType, label: "Channels", description: "Creates a row that displays a list of channel icons" },
    { type: "large_text_block" as CategoryType, label: "Text Divider", description: "Adds a large text heading to separate page sections" },
    { type: "divider" as CategoryType, label: "Line Divider", description: "Adds a simple visual line to separate content" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Add New"}
          </DialogTitle>
          <DialogDescription>
            {category ? "Configure the category settings and assign custom filters." : "Select a type and configure the new section."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="space-y-3">
            <Label htmlFor="type">Type *</Label>
            <div className="grid grid-cols-1 gap-2">
              {availableTypes.map(({ type, label, description }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={cn(
                    "flex items-start gap-3 p-4 border rounded-lg text-left transition-colors",
                    formData.type === type
                      ? "border-blue-500 bg-blue-50"
                      : "border-border/60 hover:bg-muted/50"
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted border flex-shrink-0">
                    {sectionConfig[type]?.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{label}</div>
                    <div className="text-sm text-muted-foreground mt-1">{description}</div>
                  </div>
                  {formData.type === type && (
                    <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Fields */}
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Featured, Trending"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description for internal notes"
                rows={3}
              />
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

interface HomeSectionItemProps {
  section: Category;
  index: number;
  total: number;
  isReordering: boolean;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onEdit?: (section: Category) => void;
  onDelete?: (id: string) => void;
}

function HomeSectionItem({
  section,
  index,
  total,
  isReordering,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: HomeSectionItemProps) {
  const config = sectionConfig[section.type] || sectionConfig.divider;

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-3 border-b border-border/60 bg-white hover:bg-muted/30 transition-colors",
        isReordering && "opacity-70 pointer-events-none"
      )}
    >
      {isReordering && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      )}
      
      {/* Drag Handle */}
      <div className="flex items-center gap-1 cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Position */}
      <div className="w-12 text-sm font-medium text-muted-foreground">
        {index + 1}
      </div>

      {/* Type Badge */}
      <div className="w-32">
        <span
          className={cn("inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border", config.color)}
        >
          {config.label}
        </span>
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground truncate block">
          {section.name || config.label}
        </span>
      </div>

      {/* Description */}
      <div className="w-64 min-w-0">
        <p className="text-sm text-muted-foreground truncate">
          {section.description || "-"}
        </p>
      </div>

      {/* Status */}
      <div className="w-28">
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", section.isActive ? 'text-green-700 bg-green-100 border-green-200' : 'text-gray-600 bg-gray-100 border-gray-200')}>
          {section.isActive ? 'PUBLISHED' : 'DRAFT'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          disabled={index === 0 || isReordering}
          onClick={() => onMoveUp(index)}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          disabled={index === total - 1 || isReordering}
          onClick={() => onMoveDown(index)}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
          onClick={() => onEdit?.(section)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete?.(section.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CategoryManagementPage() {
  const { categories, loading, error, refetch } = useCategories();
  const { filters } = useFilters();
  const { createCategory } = useCreateCategory();
  const { deleteCategory } = useDeleteCategory();
  const { updateCategory } = useUpdateCategoryGeneric();
  
  const [showAddMenu, setShowAddMenu] = React.useState(false);
  const [isReordering, setIsReordering] = React.useState(false);
  const [editDialog, setEditDialog] = React.useState<{ open: boolean; category: Category | null }>({ open: false, category: null });
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const sortedSections = React.useMemo(() => {
    return [...categories].sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [categories]);

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    performMove(index, index - 1);
  };

  const handleMoveDown = async (index: number) => {
    if (index === sortedSections.length - 1) return;
    performMove(index, index + 1);
  };

  const performMove = async (fromIndex: number, toIndex: number) => {
    setIsReordering(true);
    try {
      const items = [...sortedSections];
      const fromItem = items[fromIndex];
      const toItem = items[toIndex];

      await Promise.all([
        updateCategory({ id: fromItem.id, position: toItem.position }),
        updateCategory({ id: toItem.id, position: fromItem.position }),
      ]);
      
      refetch();
    } catch (error) {
      console.error("Failed to reorder:", error);
    } finally {
      setIsReordering(false);
    }
  };

  const handleAddSection = async (type: CategoryType) => {
    const config = sectionConfig[type];
    const newPosition = sortedSections.length;

    await createCategory({
      type,
      name: config?.defaultName || type,
      position: newPosition,
    });

    setShowAddMenu(false);
    refetch();
  };

  const handleEditCategory = (category: Category) => {
    setEditDialog({ open: true, category });
  };

  const handleSaveCategory = async (data: any) => {
    if (editDialog.category) {
      await updateCategory({ id: editDialog.category.id, ...data });
    } else {
      await createCategory(data);
    }
    refetch();
  };

  const handleDeleteClick = (id: string) => {
    setDeleteDialog({ open: true, id });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.id) {
      await deleteCategory(deleteDialog.id);
      setDeleteDialog({ open: false, id: null });
      refetch();
    }
  };

  const availableTypes = [
    { type: "hero_banner" as CategoryType, label: "Hero Banner" },
    { type: "video_row" as CategoryType, label: "Video Row" },
    { type: "large_text_block" as CategoryType, label: "Text Divider" },
    { type: "category_card_row" as CategoryType, label: "Channels Row" },
    { type: "divider" as CategoryType, label: "Divider" },
  ];

  const sectionToDelete = deleteDialog.id ? sortedSections.find((s) => s.id === deleteDialog.id) : null;
  const sectionConfigToDelete = sectionToDelete ? sectionConfig[sectionToDelete.type] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Category & Row Management"
        description="View All Categories: A master list of all categories (rows) currently displayed on the front end."
      />

      <Card className="border-border/60 bg-white overflow-hidden">
        <CardHeader className="border-b border-border/60">
          <div className="flex items-center justify-between">
            <CardTitle>View All Categories</CardTitle>
            <div className="relative">
              <Button onClick={() => setShowAddMenu(!showAddMenu)} disabled={isReordering}>
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
              {showAddMenu && (
                <div className="absolute right-0 top-full mt-2 z-10 w-56 bg-background border rounded-lg shadow-lg p-2">
                  {availableTypes.map(({ type, label }) => (
                    <button
                      key={type}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-md text-left"
                      onClick={() => handleAddSection(type)}
                    >
                      {sectionConfig[type]?.icon}
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="flex items-center gap-4 px-4 py-3 bg-muted/50 border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="w-6"></div>
            <div className="w-12">Position</div>
            <div className="w-32">Type</div>
            <div className="flex-1">Name</div>
            <div className="w-64">Description</div>
            <div className="w-28">Status</div>
            <div className="w-32">Actions</div>
          </div>
          
          <DataContainer
            loading={loading}
            error={error}
            empty={!sortedSections.length}
            emptyMessage="No categories configured. Add your first category to organize the homepage."
          >
            <div className="relative">
              {sortedSections.map((section, index) => (
                <HomeSectionItem
                  key={section.id}
                  section={section}
                  index={index}
                  total={sortedSections.length}
                  isReordering={isReordering}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          </DataContainer>
        </CardContent>
      </Card>

      <CategoryEditDialog
        category={editDialog.category}
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, category: null })}
        onSave={handleSaveCategory}
        filters={filters}
      />

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: deleteDialog.id })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
              {sectionToDelete && sectionConfigToDelete && (
                <span className="block mt-2 font-medium text-foreground">
                  {sectionConfigToDelete.icon} {sectionToDelete.name || sectionConfigToDelete.label}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, id: null })}
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
