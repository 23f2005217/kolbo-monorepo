"use client";

import { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  linkHref?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  linkHref,
}: MetricCardProps) {
  return (
    <Card className="border-border/60 bg-white">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardDescription>{title}</CardDescription>
          <CardTitle className={cn("mt-2", subtitle ? "text-xl" : "text-2xl")}>
            {value}
          </CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-white">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      {linkHref && (
        <CardContent className="pt-2">
          <Button variant="link" size="sm" className="h-auto p-0 text-sm">
            View more
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
