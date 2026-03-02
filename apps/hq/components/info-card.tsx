"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";
import { LucideIcon } from "lucide-react";

interface InfoCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  loading?: boolean;
  className?: string;
}

import { Loader2 } from "lucide-react";

export function InfoCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  trend,
  loading,
  className,
}: InfoCardProps) {
  return (
    <Card className={cn("border-border/60 bg-white", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <CardTitle className="text-2xl">
            {loading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : value}
          </CardTitle>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-white">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-center justify-between">
          {badge && (
            <Badge variant={badge.variant || "default"}>{badge.text}</Badge>
          )}
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              <span
                className={cn(
                  "font-medium",
                  trend.positive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.positive ? "+" : "-"}{trend.value}%
              </span>
              <span className="text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
