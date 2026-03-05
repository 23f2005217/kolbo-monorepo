"use client";

import * as React from "react";
import { Plus, MoreHorizontal, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shell } from "@/components/shell";
import { useCategories, useCreateCategory, useUpdateCategoryGeneric, useDeleteCategory } from "@/hooks/use-categories";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function CategoriesPage() {
  const { categories, loading, refetch } = useCategories();
  const { createCategory } = useCreateCategory();
  const { updateCategory } = useUpdateCategoryGeneric();
  const { deleteCategory } = useDeleteCategory();
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState("");
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;
    await createCategory({ name: newCategoryName.trim(), type: "content", position: categories.length });
    setNewCategoryName("");
    refetch();
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;
    await updateCategory({ id, name: editingName.trim() });
    setEditingId(null);
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteCategory(deleteId);
    setDeleteId(null);
    refetch();
  };

  const sorted = [...categories].sort((a, b) => (a.position || 0) - (b.position || 0));

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button onClick={handleCreate} disabled={!newCategoryName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
            ) : sorted.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No categories yet</div>
            ) : (
              <div className="divide-y">
                {sorted.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors">
                    <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                    {editingId === cat.id ? (
                      <Input
                        className="flex-1 h-8"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(cat.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                      />
                    ) : (
                      <span className="flex-1 text-sm font-medium">{cat.name}</span>
                    )}
                    <Badge variant={cat.isActive ? "default" : "secondary"} className="text-[10px]">
                      {cat.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(cat.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the category. Videos assigned to this category will be unlinked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Shell>
  );
}
