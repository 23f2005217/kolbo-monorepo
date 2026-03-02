"use client";

import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/utils";

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function ActionButton({
  icon: Icon,
  label,
  variant = "default",
  size = "sm",
  onClick,
  className,
  disabled,
}: ActionButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn("gap-2", className)}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}
