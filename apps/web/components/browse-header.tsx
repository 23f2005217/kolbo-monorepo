'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Radio,
  LayoutGrid,
  Heart,
  List,
  Search,
  ChevronRight,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useUserAuth } from '@/hooks/use-user-auth';
import { cn } from '@kolbo/ui';

const navItems = [
  { label: 'LIVE', href: '/browse', icon: Radio },
  { label: 'CHANNELS', href: '/browse', icon: LayoutGrid },
  { label: 'FAVORITES', href: '/browse', icon: Heart },
  { label: 'PLAYLISTS', href: '/browse', icon: List },
  { label: 'SEARCH', href: '/search', icon: Search },
];

interface BrowseHeaderProps {
  transparent?: boolean;
}

export function BrowseHeader({ transparent = false }: BrowseHeaderProps) {
  const { userProfile, isAuthenticated, loading, logout } = useUserAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 flex h-14 items-center justify-between gap-4 transition-all duration-300 px-4 md:px-8",
      transparent ? "bg-transparent border-transparent" : "bg-[#0a0b14]/80 backdrop-blur-md border-b border-white/10"
    )}>
      <Link
        href="/"
        className="flex items-center gap-0.5 text-xl font-semibold text-white"
      >
        KolB
        <span className="flex size-5 items-center justify-center rounded bg-white/90 text-[#0a0b14]">
          <svg
            viewBox="0 0 24 24"
            className="size-3"
            fill="currentColor"
            aria-hidden
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </Link>

      <nav className="flex flex-1 items-center justify-center gap-1 md:gap-4">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white md:px-3"
          >
            <Icon className="size-4" aria-hidden />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {loading ? (
        <div className="h-9 w-24 animate-pulse rounded-full bg-white/10" />
      ) : isAuthenticated && userProfile ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-full bg-white/10 py-1.5 pl-1.5 pr-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-r from-[#4A90FF] to-[#6B5FFF] text-xs font-semibold">
              {getInitials(userProfile.name || userProfile.email)}
            </span>
            <span className="hidden max-w-[100px] truncate md:block">
              {userProfile.name || userProfile.email.split('@')[0]}
            </span>
            {userProfile.hasSubscriptions && (
              <span className="hidden sm:flex px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                PRO
              </span>
            )}
            <ChevronDown className={`size-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-lg border border-white/10 bg-[#1a1b2e] shadow-xl">
              <div className="border-b border-white/10 px-4 py-3">
                <p className="truncate text-sm font-medium text-white">
                  {userProfile.name || 'User'}
                </p>
                <p className="truncate text-xs text-white/60">{userProfile.email}</p>
              </div>
              <div className="py-1">
                <Link
                  href="/account"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <User className="size-4" />
                  My Account
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Settings className="size-4" />
                  Settings
                </Link>
              </div>
              <div className="border-t border-white/10 py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-white/10 hover:text-red-300"
                >
                  <LogOut className="size-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#4A90FF] to-[#6B5FFF] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Sign In
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      )}
    </header>
  );
}
