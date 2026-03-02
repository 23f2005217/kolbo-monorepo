"use client";

import React from "react";
import { cn } from "@/utils";
import { HTMLAttributes } from "react";

interface DataTableProps extends HTMLAttributes<HTMLDivElement> {
  columns: string[];
  children: React.ReactNode;
}

export function DataTable({ columns, children, className, ...props }: DataTableProps) {
  return (
    <div className={cn("rounded-md border border-border/60 bg-white", className)} {...props}>
      <div className="grid gap-0" style={{ gridTemplateColumns: columns.map(() => "1fr").join(" ") }}>
        {children}
      </div>
    </div>
  );
}

interface DataTableHeaderCellProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function DataTableHeaderCell({ children, className, ...props }: DataTableHeaderCellProps) {
  return (
    <div className={cn("px-4 py-3 text-sm font-semibold text-foreground border-b border-border/60", className)} {...props}>
      {children}
    </div>
  );
}

interface DataTableCellProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function DataTableCell({ children, className, ...props }: DataTableCellProps) {
  return (
    <div className={cn("px-4 py-3 text-sm text-foreground border-b border-border/60 last:border-b-0", className)} {...props}>
      {children}
    </div>
  );
}

interface DataTableRowProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function DataTableRow({ children, className, ...props }: DataTableRowProps) {
  return (
    <div className={cn("grid gap-0", className)} style={{ gridTemplateColumns: `repeat(${React.Children.count(children)}, 1fr)` }} {...props}>
      {children}
    </div>
  );
}
