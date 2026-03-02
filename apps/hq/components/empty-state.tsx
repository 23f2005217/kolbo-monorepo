"use client";

import { Search, FileX, FolderOpen, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: "search" | "file" | "folder" | "package" | "none";
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const icons = {
  search: Search,
  file: FileX,
  folder: FolderOpen,
  package: Package,
};

export function EmptyState({
  icon = "file",
  title,
  description,
  action,
}: EmptyStateProps) {
  const Icon = icon !== "none" ? icons[icon] : null;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
          {description}
        </p>
      )}
      {action && (
        <Button className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
