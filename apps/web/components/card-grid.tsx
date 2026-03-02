"use client";

import { cn } from "@/utils";

interface CardGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function CardGrid({
  children,
  className,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
}: CardGridProps) {
  const gridClasses = cn(
    "grid gap-6",
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    className
  );

  return <div className={gridClasses}>{children}</div>;
}
