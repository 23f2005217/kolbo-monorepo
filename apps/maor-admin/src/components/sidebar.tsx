"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/utils";
import {
  Video,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuthContext } from "@/components/admin-auth-provider";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Videos",
    href: "/",
    icon: <Video className="h-5 w-5" />,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { logout, adminProfile } = useAdminAuthContext();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div
      className={cn(
        "flex h-full w-[240px] flex-col border-r bg-sidebar",
        className
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex h-10 w-full items-center justify-start rounded-lg px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              M
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold">Maor Dashboard</span>
              <span className="text-xs text-muted-foreground capitalize">Channel Admin</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-auto py-4">
        <ul className="space-y-1 px-4">
          {navItems.map((item) => (
            <li key={item.label}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start px-3 py-2.5 h-10",
                  isActive(item.href) && "bg-primary/10 text-primary"
                )}
                asChild
              >
                <a href={item.href}>
                  {item.icon}
                  <span className="ml-3 text-sm">{item.label}</span>
                </a>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <User className="h-5 w-5" />
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium">{adminProfile?.displayName || 'Admin'}</span>
            <span className="text-xs text-muted-foreground">{adminProfile?.email || 'admin@mymaor.org'}</span>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
