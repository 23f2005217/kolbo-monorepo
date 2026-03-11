"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/utils";
import {
  LayoutDashboard,
  Play,
  Radio,
  ListVideo,
  Calendar,
  FolderOpen,
  Globe,
  Megaphone,
  BarChart3,
  Wallet,
  Share2,
  ChevronRight,
  User,
  Users,
  Target,
  Settings,
  LogOut,
  ChevronsUpDown,
  Video,
  Clock,
  Plus,
  Layers,
  Palette,
  Image as ImageIcon,
  Layout,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore, type Workspace } from "@/stores/workspace-store";
import { useAdminAuthContext } from "@/components/admin-auth-provider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: { label: string; href: string; icon: React.ReactNode }[];
}

const hqNavItems: NavItem[] = [
  {
    label: "Overview",
    href: "/overview",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: "Content",
    href: "/content",
    icon: <Play className="h-4 w-4" />,
    children: [
      { label: "Channel", href: "/content/channel", icon: <Layout className="h-4 w-4" /> },
      { label: "Videos", href: "/content/videos", icon: <Video className="h-4 w-4" /> },
      { label: "Live Streaming", href: "/content/live", icon: <Radio className="h-4 w-4" /> },
      { label: "Playlists", href: "/content/playlists", icon: <ListVideo className="h-4 w-4" /> },
      { label: "Calendar", href: "/content/calendar", icon: <Calendar className="h-4 w-4" /> },
      { label: "Organize", href: "/content/organize", icon: <FolderOpen className="h-4 w-4" /> },
    ],
  },
  {
    label: "Live!",
    href: "/live",
    icon: <Radio className="h-4 w-4" />,
  },
  {
    label: "Subscriptions",
    href: "/subscriptions",
    icon: <Clock className="h-4 w-4" />,
    children: [
      { label: "Plans", href: "/subscriptions/plans", icon: <Clock className="h-4 w-4" /> },
      { label: "Bundles", href: "/subscriptions/bundles", icon: <Layers className="h-4 w-4" /> },
    ],
  },
  {
    label: "Website",
    href: "/website",
    icon: <Globe className="h-4 w-4" />,
    children: [
      { label: "Channel page", href: "/website", icon: <Settings className="h-4 w-4" /> },
      { label: "Channel nav", href: "/website/channel-nav", icon: <Palette className="h-4 w-4" /> },
      { label: "Email templates", href: "/website/email-templates", icon: <ImageIcon className="h-4 w-4" /> },
    ],
  },
  {
    label: "Marketing",
    href: "/marketing",
    icon: <Megaphone className="h-4 w-4" />,
    children: [
      { label: "Overview", href: "/marketing", icon: <BarChart3 className="h-4 w-4" /> },
      { label: "Email Templates", href: "/marketing/email-templates", icon: <Mail className="h-4 w-4" /> },
    ],
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    label: "Sales",
    href: "/sales",
    icon: <Wallet className="h-4 w-4" />,
  },
  {
    label: "RevShare",
    href: "/revshare",
    icon: <Share2 className="h-4 w-4" />,
  },
  {
    label: "Subsites",
    href: "/subsites",
    icon: <Layers className="h-4 w-4" />,
  },
];

const adServerNavItems: NavItem[] = [
  {
    label: "Overview",
    href: "/ads",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: "Accounts",
    href: "/ads/accounts",
    icon: <Users className="h-4 w-4" />,
  },
  {
    label: "Campaigns",
    href: "/ads/campaigns",
    icon: <Megaphone className="h-4 w-4" />,
  },
  {
    label: "Audience",
    href: "/ads/audience",
    icon: <Target className="h-4 w-4" />,
  },
  {
    label: "Content",
    href: "/ads/content",
    icon: <Video className="h-4 w-4" />,
  },
  {
    label: "Analytics",
    href: "/ads/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openItems, setOpenItems] = React.useState<Set<string>>(new Set());
  const { currentWorkspace, availableWorkspaces, setCurrentWorkspace } = useWorkspaceStore();
  const { logout, adminProfile } = useAdminAuthContext();

  const navItems = currentWorkspace.name === 'AdServer' ? adServerNavItems : hqNavItems;

  React.useEffect(() => {
    if (pathname.startsWith('/ads')) {
      const adServerWorkspace = availableWorkspaces.find(w => w.name === 'AdServer');
      if (adServerWorkspace && currentWorkspace.id !== adServerWorkspace.id) {
        setCurrentWorkspace(adServerWorkspace);
      }
    }
  }, [pathname, availableWorkspaces, currentWorkspace, setCurrentWorkspace]);

  React.useEffect(() => {
    const itemsToOpen = new Set<string>();

    navItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => {
          if (pathname === child.href) return true;
          if (pathname.startsWith(child.href + "/")) return true;
          return false;
        });

        if (hasActiveChild) {
          itemsToOpen.add(item.label);
        }
      }
    });

    setOpenItems(itemsToOpen);
  }, [pathname, navItems]);

  const toggleItem = (label: string) => {
    const newOpen = new Set(openItems);
    if (newOpen.has(label)) {
      newOpen.delete(label);
    } else {
      newOpen.add(label);
    }
    setOpenItems(newOpen);
  };

  const isActive = (href: string) => {
    if (pathname === href) return true;
    if (pathname.startsWith(href + "/")) return true;
    return false;
  };

  const handleWorkspaceChange = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    router.push(workspace.href || '/hq');
  };

  return (
    <div
      className={cn(
        "flex h-full w-[240px] flex-col border-r bg-sidebar",
        className
      )}
    >
      {/* Logo / Workspace Switcher */}
      <div className="flex h-14 items-center border-b px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto w-full justify-between px-2 py-1.5"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                  {currentWorkspace.name.charAt(0)}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold">{currentWorkspace.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{currentWorkspace.type}</span>
                </div>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableWorkspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleWorkspaceChange(workspace)}
                className={cn(
                  "flex items-center gap-2",
                  currentWorkspace.id === workspace.id && "bg-accent"
                )}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">
                  {workspace.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{workspace.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{workspace.type}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create new workspace</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.label}>

              {item.children ? (
                <Collapsible
                  open={openItems.has(item.label)}
                  onOpenChange={() => toggleItem(item.label)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between px-2 py-1.5 h-9",
                        isActive(item.href) && "bg-primary/10 text-primary"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          openItems.has(item.label) && "rotate-90"
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="ml-4 mt-1 space-y-1 border-l pl-2">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start px-2 py-1.5 h-8",
                              isActive(child.href)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                            asChild
                          >
                            <a href={child.href}>
                              {child.icon}
                              <span className="ml-2 text-sm">{child.label}</span>
                            </a>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-2 py-1.5 h-9",
                    isActive(item.href) && "bg-primary/10 text-primary"
                  )}
                  asChild
                >
                  <a href={item.href}>
                    {item.icon}
                    <span className="ml-2 text-sm">{item.label}</span>
                  </a>
                </Button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium">{adminProfile?.displayName || 'Admin'}</span>
            <span className="text-xs text-muted-foreground">{adminProfile?.email || 'admin@kolbo.com'}</span>
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
