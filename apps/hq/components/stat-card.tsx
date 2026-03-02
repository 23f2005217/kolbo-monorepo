"use client";

import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  positiveIsGood?: boolean;
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  positiveIsGood = true,
}: StatCardProps) {
  const hasChange = change !== undefined;

  const isPositive = hasChange && (positiveIsGood ? change > 0 : change < 0);
  const isNegative = hasChange && (positiveIsGood ? change < 0 : change > 0);

  return (
    <div className="flex items-center justify-between p-4 border border-border/60 rounded-lg bg-white">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {hasChange && (
          <div className="flex items-center gap-1 text-xs">
            {isPositive ? (
              <ArrowUp className="h-3 w-3 text-green-600" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-600" />
            )}
            <span
              className={cn(
                "font-medium",
                isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {Math.abs(change!)}%
            </span>
            {changeLabel && (
              <span className="text-muted-foreground">{changeLabel}</span>
            )}
          </div>
        )}
      </div>
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-white">
          {icon}
        </div>
      )}
    </div>
  );
}
