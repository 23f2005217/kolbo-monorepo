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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  LayoutDashboard,
  FolderOpen,
  Settings,
  Tag,
  Search,
  User,
} from "lucide-react";
import { cn } from "@/utils";
import { DataContainer } from "@/components/data/data-container";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useCategories, Category, useCreateCategory, useDeleteCategory, useUpdateCategoryGeneric } from "@/hooks/use-categories";
import { useFilters, Filter, useCreateFilter, useUpdateFilterGeneric, useDeleteFilter } from "@/hooks/use-filters";
import { useAuthors, Author, useCreateAuthor, useUpdateAuthorGeneric, useDeleteAuthor } from "@/hooks/use-authors";
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
    label: "HERO BANNER",
    icon: <Image className="h-5 w-5" />,
    color: "bg-purple-600 text-white",
    defaultName: "Hero Banner",
  },
  "video_row": {
    label: "VIDEO ROW",
    icon: <Film className="h-5 w-5" />,
    color: "bg-blue-600 text-white",
    defaultName: "Video Row",
  },
  "large_text_block": {
    label: "TEXT DIVIDER",
    icon: <Type className="h-5 w-5" />,
    color: "bg-green-600 text-white",
    defaultName: "Text Divider",
  },
  "category_card_row": {
    label: "CHANNELS ROW",
    icon: <LayoutGrid className="h-5 w-5" />,
    color: "bg-orange-600 text-white",
    defaultName: "Channels Row",
  },
  "divider": {
    label: "DIVIDER",
    icon: <GripVertical className="h-5 w-5" />,
    color: "bg-gray-600 text-white",
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
    position: 1,
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
        position: category.position || 1,
        isActive: category.isActive ?? true,
        filterIds: (category.config?.filterIds as string[]) || [],
      });
    } else {
      setFormData({
        type: "video_row",
        name: "",
        description: "",
        position: 1,
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

  const availableTypes = [
    { type: "video_row" as CategoryType, label: "Category" },
    { type: "hero_banner" as CategoryType, label: "Hero Banner" },
    { type: "category_card_row" as CategoryType, label: "Channels Row" },
    { type: "large_text_block" as CategoryType, label: "Text Divider" },
    { type: "divider" as CategoryType, label: "Divider" },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {category ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Create a new category to organize your content.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({ ...formData, type: value as CategoryType })}
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((t) => (
                  <SelectItem key={t.type} value={t.type}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position" className="text-sm font-medium">Position</Label>
            <Input
              id="position"
              type="number"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 1 })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Category Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Featured, Trending"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description"
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-muted/50">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {category ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AuthorEditDialogProps {
  author: Author | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

function AuthorEditDialog({ author, open, onClose, onSave }: AuthorEditDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    bio: "",
    imageUrl: "",
    payoutEmail: "",
    subscriptionSplit: 50,
  });

  React.useEffect(() => {
    if (open) {
      setFormData({
        name: author?.name || "",
        email: author?.email || "",
        bio: author?.bio || "",
        imageUrl: author?.imageUrl || "",
        payoutEmail: author?.payoutEmail || "",
        subscriptionSplit: author?.subscriptionSplit || 50,
      });
    }
  }, [author, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save author:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {author ? "Edit Author" : "Add New Author"}
          </DialogTitle>
          <DialogDescription>
            Configure the author profile settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="authorName">Author Name *</Label>
              <Input
                id="authorName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authorEmail">Email *</Label>
              <Input
                id="authorEmail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g., john@example.com"
                required
              />
            </div>
          </div>
          {author && (
            <>
              <div className="space-y-2">
                <Label htmlFor="authorBio">Author Bio</Label>
                <Textarea
                  id="authorBio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Write a biography for this author..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorImage">Author Image</Label>
                <Input
                  id="authorImage"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground">Recommended resolution: 740x740 pixels</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payoutEmail">Payout Email</Label>
                  <Input
                    id="payoutEmail"
                    type="email"
                    value={formData.payoutEmail}
                    onChange={(e) => setFormData({ ...formData, payoutEmail: e.target.value })}
                    placeholder="e.g., payout@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscriptionSplit">Subscription Split (%)</Label>
                  <Input
                    id="subscriptionSplit"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.subscriptionSplit}
                    onChange={(e) => setFormData({ ...formData, subscriptionSplit: parseInt(e.target.value) || 0 })}
                    placeholder="50"
                  />
                </div>
              </div>
            </>
          )}
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
        "grid grid-cols-[100px_1fr_250px_100px_140px] items-center gap-4 px-6 py-4 bg-white hover:bg-muted/30 transition-colors relative",
        isReordering && "opacity-70 pointer-events-none"
      )}
    >
      {isReordering && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      )}
      
      {/* POSITION/TYPE - combined column: grip + number, type badge below */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground">{index + 1}</span>
        </div>
        <span className={cn("inline-flex text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-fit", config.color)}>
          {config.label}
        </span>
      </div>

      {/* Name */}
      <div className="min-w-0">
        <span className="text-sm font-semibold text-foreground truncate block">
          {section.name || config.label}
        </span>
      </div>

      {/* Description */}
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground truncate">
          {section.description || "-"}
        </p>
      </div>

      {/* Status */}
      <div>
        <span className={cn(
          "text-[9px] font-bold px-2 py-0.5 rounded uppercase",
          section.isActive ? 'bg-green-600 text-white' : 'bg-muted/50 text-muted-foreground'
        )}>
          {section.isActive ? 'PUBLISHED' : 'DRAFT'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground/60" 
          disabled={index === 0 || isReordering}
          onClick={() => onMoveUp(index)}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground/60" 
          disabled={index === total - 1 || isReordering}
          onClick={() => onMoveDown(index)}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50" 
          onClick={() => onEdit?.(section)}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => onDelete?.(section.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function OrganizePage() {
  const { categories, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories();
  const { filters, loading: filtersLoading, error: filtersError, refetch: refetchFilters } = useFilters();
  const { authors, loading: authorsLoading, error: authorsError, refetch: refetchAuthors } = useAuthors();
  
  const { createCategory } = useCreateCategory();
  const { deleteCategory } = useDeleteCategory();
  const { updateCategory } = useUpdateCategoryGeneric();
  
  const { createFilter } = useCreateFilter();
  const { updateFilter } = useUpdateFilterGeneric();
  const { deleteFilter } = useDeleteFilter();
  
  const { createAuthor } = useCreateAuthor();
  const { updateAuthor: updateAuthorGeneric } = useUpdateAuthorGeneric();
  const { deleteAuthor } = useDeleteAuthor();
  
  const [isReordering, setIsReordering] = React.useState(false);
  const [editDialog, setEditDialog] = React.useState<{ open: boolean; category: Category | null }>({ open: false, category: null });
  const [filterEditDialog, setFilterEditDialog] = React.useState<{ open: boolean; filter: Filter | null }>({ open: false, filter: null });
  const [authorEditDialog, setAuthorEditDialog] = React.useState<{ open: boolean; author: Author | null }>({ open: false, author: null });
  const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; id: string | null; type: 'category' | 'filter' | 'author' }>({ open: false, id: null, type: 'category' });
  const [activeSection, setActiveSection] = React.useState("homepage");
  const [editingAuthor, setEditingAuthor] = React.useState<Author | null>(null);
  const [authorSearch, setAuthorSearch] = React.useState("");
  const [authorFormData, setAuthorFormData] = React.useState({
    name: "",
    bio: "",
    imageUrl: "",
  });
  const [filterFormData, setFilterFormData] = React.useState({
    name: "",
    position: 1,
  });

  const loading = categoriesLoading || filtersLoading || authorsLoading;
  const error = categoriesError || filtersError || authorsError;

  React.useEffect(() => {
    if (editingAuthor) {
      setAuthorFormData({
        name: editingAuthor.name || "",
        bio: editingAuthor.bio || "",
        imageUrl: editingAuthor.imageUrl || "",
      });
    }
  }, [editingAuthor]);

  React.useEffect(() => {
    if (filterEditDialog.filter) {
      setFilterFormData({
        name: filterEditDialog.filter.name || "",
        position: filterEditDialog.filter.position || 1,
      });
    } else {
      setFilterFormData({
        name: "",
        position: 1,
      });
    }
  }, [filterEditDialog.open, filterEditDialog.filter]);

  const sortedSections = React.useMemo(() => {
    return [...categories].sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [categories]);

  const filteredAuthors = React.useMemo(() => {
    if (!authorSearch.trim()) return authors;
    const q = authorSearch.toLowerCase();
    return authors.filter((a) => a.name.toLowerCase().includes(q));
  }, [authors, authorSearch]);

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
      
      refetchCategories();
    } catch (error) {
      console.error("Failed to reorder:", error);
    } finally {
      setIsReordering(false);
    }
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
    refetchCategories();
  };

  const handleSaveFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (filterEditDialog.filter) {
        await updateFilter({ id: filterEditDialog.filter.id, ...filterFormData });
      } else {
        await createFilter(filterFormData);
      }
      refetchFilters();
      setFilterEditDialog({ open: false, filter: null });
    } catch (error) {
      console.error("Failed to save filter:", error);
    }
  };

  const handleSaveAuthor = async () => {
    if (editingAuthor) {
      try {
        await updateAuthorGeneric({ id: editingAuthor.id, ...authorFormData });
        setEditingAuthor(null);
        refetchAuthors();
      } catch (error) {
        console.error("Failed to save author:", error);
      }
    }
  };

  const handleCreateAuthor = async (data: any) => {
    await createAuthor(data);
    refetchAuthors();
  };

  const handleDeleteClick = (id: string, type: 'category' | 'filter' | 'author' = 'category') => {
    setDeleteDialog({ open: true, id, type });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.id) {
      if (deleteDialog.type === 'category') {
        await deleteCategory(deleteDialog.id);
        refetchCategories();
      } else if (deleteDialog.type === 'filter') {
        await deleteFilter(deleteDialog.id);
        refetchFilters();
      } else if (deleteDialog.type === 'author') {
        await deleteAuthor(deleteDialog.id);
        setEditingAuthor(null);
        refetchAuthors();
      }
      setDeleteDialog({ open: false, id: null, type: 'category' });
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

  const sidebarSections = [
    { id: "homepage", label: "Categories", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "filters", label: "Custom filters", icon: <Tag className="h-4 w-4" /> },
    { id: "authors", label: "Authors", icon: <User className="h-4 w-4" /> },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#fafafa]">
      {/* Left Sidebar */}
      <div className="w-64 border-r bg-white">
        <div className="p-6">
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">
            ORGANIZE
          </h2>
          <nav className="space-y-1">
            {sidebarSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  activeSection === section.id
                    ? "text-white bg-[#18181b] shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-10 max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-[#18181b]">
              {activeSection === "homepage" ? "Organize Homepage" : 
               activeSection === "filters" ? "Custom filters" : "Authors"}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {activeSection === "homepage" ? "Control the visual hierarchy of your frontend" : 
               activeSection === "filters" ? "Create and manage custom filters for search bars and playlist views." : "Manage authors for your content."}
            </p>
          </div>

          {activeSection === "homepage" && (
            <div className="bg-white rounded-xl border border-border/60 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Categories</h3>
                <Button 
                  onClick={() => setEditDialog({ open: true, category: null })} 
                  className="bg-[#18181b] hover:bg-[#27272a] text-white text-xs h-9 rounded-md px-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </div>
              <div className="grid grid-cols-[100px_1fr_250px_100px_140px] items-center gap-4 px-6 py-3 bg-muted/20 border-b border-border/40 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <div>POSITION / TYPE</div>
                <div>NAME</div>
                <div>DESCRIPTION</div>
                <div>STATUS</div>
                <div className="text-right">ACTIONS</div>
              </div>
              
              <DataContainer
                loading={loading}
                error={error}
                empty={!sortedSections.length}
                emptyMessage="No categories configured."
              >
                <div className="divide-y divide-border/40">
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
            </div>
          )}

          {activeSection === "filters" && (
            <div className="bg-white rounded-xl border border-border/60 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Custom filters</h3>
                <Button 
                  onClick={() => setFilterEditDialog({ open: true, filter: null })} 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 rounded-md px-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </div>
              
              <DataContainer
                loading={loading}
                error={error}
                empty={!filters.length}
                emptyMessage="No custom filters yet. Click 'Add New' to create one."
              >
                <>
                  {filters.length > 0 && (
                    <div className="grid grid-cols-[1fr_120px_140px_100px] items-center gap-4 px-6 py-3 bg-muted/20 border-b border-border/40 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <div>NAME</div>
                      <div>POSITION</div>
                      <div>ADDED</div>
                      <div className="text-right"></div>
                    </div>
                  )}
                  <div className="divide-y divide-border/40">
                    {filters.map((filter) => (
                      <div key={filter.id} className="grid grid-cols-[1fr_120px_140px_100px] items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                        <div className="font-medium text-sm text-foreground">{filter.name}</div>
                        <div className="text-sm text-muted-foreground">{filter.position}</div>
                        <div className="text-sm text-muted-foreground">
                          {filter.createdAt ? new Date(filter.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground/60 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => setFilterEditDialog({ open: true, filter })}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground/60 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteClick(filter.id, 'filter')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              </DataContainer>
              <div className="p-6 border-t border-border/40 flex items-center gap-2">
                <Checkbox id="filters-learn-more" />
                <label htmlFor="filters-learn-more" className="text-xs text-muted-foreground font-medium cursor-pointer">
                  Learn more about <span className="font-bold text-foreground">Custom Filters</span>
                </label>
              </div>
            </div>
          )}

          {activeSection === "authors" && editingAuthor && (
            <div className="space-y-12 max-w-4xl">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <button onClick={() => setEditingAuthor(null)} className="hover:text-foreground">Authors</button>
                <span>/</span>
                <span className="text-foreground font-medium">{editingAuthor.name}</span>
              </div>

              <div className="grid grid-cols-[300px_1fr] gap-x-12 gap-y-12">
                <div>
                  <h3 className="text-sm font-semibold text-[#18181b]">Author Name</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    This will also appear on Video/Collection pages associated with this author.
                  </p>
                </div>
                <Input 
                  value={authorFormData.name}
                  onChange={(e) => setAuthorFormData({ ...authorFormData, name: e.target.value })}
                  className="bg-white border-border/60 focus-visible:ring-1 focus-visible:ring-blue-500 h-11"
                />

                <div>
                  <h3 className="text-sm font-semibold text-[#18181b]">Author Bio</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    The author bio will appear on the author details page.
                  </p>
                </div>
                <RichTextEditor
                  value={authorFormData.bio || ""}
                  onChange={(value) => setAuthorFormData({ ...authorFormData, bio: value })}
                  placeholder="Write the author biography..."
                />

                <div>
                  <h3 className="text-sm font-semibold text-[#18181b]">Author Image</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Uploaded image will appear on the author page, as well as any page video or collection page connected to this author. Recommended resolution: 740x740
                  </p>
                </div>
                <div>
                  <Button variant="outline" className="bg-white border-border/60 text-xs h-10 px-6 rounded-md shadow-sm">
                    Upload Image
                  </Button>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#18181b]">Delete Author</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    By clicking on this delete button, you will permanently delete this author and all associated data.
                  </p>
                </div>
                <div>
                  <Button 
                    variant="destructive" 
                    className="bg-[#ef4444] hover:bg-[#dc2626] text-xs h-10 px-6 rounded-md shadow-sm border-0"
                    onClick={() => handleDeleteClick(editingAuthor.id, 'author')}
                  >
                    Delete author
                  </Button>
                </div>
              </div>

              <div className="pt-8 border-t border-border/60">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-11 rounded-md shadow-md font-medium"
                  onClick={handleSaveAuthor}
                >
                  Save
                </Button>
              </div>
            </div>
          )}

          {activeSection === "authors" && !editingAuthor && (
            <div className="bg-white rounded-xl border border-border/60 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  {filteredAuthors.length} {filteredAuthors.length === 1 ? 'AUTHOR' : 'AUTHORS'}
                </h3>
                <div className="flex items-center gap-3 flex-1 max-w-sm justify-end">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={authorSearch}
                      onChange={(e) => setAuthorSearch(e.target.value)}
                      className="pl-9 h-9 bg-muted/30 border-0"
                    />
                  </div>
                  <Button 
                    onClick={() => setAuthorEditDialog({ open: true, author: null })} 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 rounded-md px-4 shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-[1fr_200px_100px] items-center gap-4 px-6 py-3 bg-muted/20 border-b border-border/40 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <div>AUTHOR</div>
                <div>ADDED</div>
                <div className="text-right"></div>
              </div>
              
              <DataContainer
                loading={loading}
                error={error}
                empty={!filteredAuthors.length}
                emptyMessage="No authors configured."
              >
                <div className="divide-y divide-border/40">
                  {filteredAuthors.map((author) => (
                    <div key={author.id} className="grid grid-cols-[1fr_200px_100px] items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 rounded-lg border border-border/40 bg-muted/50">
                          <AvatarImage src={author.imageUrl} />
                          <AvatarFallback className="text-xs font-bold text-muted-foreground">
                            {author.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-semibold text-sm text-[#18181b]">{author.name}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {author.createdAt ? new Date(author.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jan 4, 2026'}
                      </div>
                      <div className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-2 font-medium"
                          onClick={() => setEditingAuthor(author)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </DataContainer>
              <div className="p-6 border-t border-border/40 flex items-center justify-center gap-2">
                <Checkbox id="authors-learn-more" />
                <label htmlFor="authors-learn-more" className="text-xs text-muted-foreground font-medium">
                  Learn more about <span className="font-bold text-foreground">Authors</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      <CategoryEditDialog
        category={editDialog.category}
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, category: null })}
        onSave={handleSaveCategory}
        filters={filters}
      />

      <AuthorEditDialog
        author={authorEditDialog.author}
        open={authorEditDialog.open}
        onClose={() => setAuthorEditDialog({ open: false, author: null })}
        onSave={handleCreateAuthor}
      />

      {/* Filter Edit Dialog */}
      <Dialog open={filterEditDialog.open} onOpenChange={(open) => setFilterEditDialog({ ...filterEditDialog, open })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {filterEditDialog.filter ? "Edit Custom Filter" : "Add New Custom Filter"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Create a new custom filter to organize your content.
            </DialogDescription>
          </DialogHeader>
          <form 
            onSubmit={handleSaveFilter} 
            className="space-y-4 py-4"
          >
            <div className="space-y-2">
              <Label htmlFor="filterName" className="text-sm font-medium">Filter Name</Label>
              <Input
                id="filterName"
                value={filterFormData.name}
                onChange={(e) => setFilterFormData({ ...filterFormData, name: e.target.value })}
                placeholder="e.g., Age recommendations"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterPosition" className="text-sm font-medium">Position</Label>
              <Input
                id="filterPosition"
                type="number"
                value={filterFormData.position}
                onChange={(e) => setFilterFormData({ ...filterFormData, position: parseInt(e.target.value) || 1 })}
                placeholder="1"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setFilterEditDialog({ open: false, filter: null })} className="hover:bg-muted/50">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                {filterEditDialog.filter ? "Save Changes" : "Create Filter"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this section? This action cannot be undone.
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
              onClick={() => setDeleteDialog({ open: false, id: null, type: 'category' })}
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
