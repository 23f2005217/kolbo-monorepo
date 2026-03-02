
"use client";

import * as React from "react";
import { cn } from "@/utils";
import { Search } from "lucide-react";
import { useAdminAuthContext } from "@/components/admin-auth-provider";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  

  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between bg-background px-4",
        className
      )}
    >
      <div className="flex flex-1 items-center max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      
    </header>
  );
}
