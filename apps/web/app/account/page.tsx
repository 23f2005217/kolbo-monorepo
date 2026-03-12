'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserAuthContext } from '@/components/user-auth-provider';
import { cn } from '@kolbo/ui';

interface Entitlement {
  id: string;
  contentType: string;
  contentId: string;
  entitlementType: string;
  startsAt: string;
  expiresAt: string | null;
  name: string;
  itemType: 'plan' | 'bundle' | 'channel' | 'unknown';
  description: string | null;
  price: number | null;
}

function formatPrice(cents: number | null | undefined) {
  if (!cents && cents !== 0) return '$0.00';
  return `$${(Math.abs(cents) / 100).toFixed(2)}`;
}

function getItemIcon(itemType: string) {
  switch (itemType) {
    case 'plan':
      return (
        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'bundle':
      return (
        <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    case 'channel':
      return (
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

function getItemTypeBadge(itemType: string) {
  const colors: Record<string, string> = {
    plan: 'bg-blue-500/20 text-blue-400',
    bundle: 'bg-yellow-500/20 text-yellow-400',
    channel: 'bg-purple-500/20 text-purple-400',
    unknown: 'bg-gray-500/20 text-gray-400',
  };
  return colors[itemType] || colors.unknown;
}

export default function AccountPage() {
  const router = useRouter();
  const { userProfile, isAuthenticated, loading: authLoading, logout } = useUserAuthContext();
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && userProfile) {
      const fetchEntitlements = async () => {
        try {
          const res = await fetch(`/api/user/entitlements?userId=${userProfile.id}`);
          if (res.ok) {
            setEntitlements(await res.json());
          }
        } catch (err) {
          console.error('Error fetching entitlements:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchEntitlements();
    }
  }, [isAuthenticated, userProfile]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-0.5 text-xl font-bold tracking-tight">
          KolB
        </Link>
        <button onClick={logout} className="text-sm text-white/60 hover:text-white transition-colors">Sign out</button>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <section className="space-y-4">
          <h1 className="text-3xl font-bold">My Account</h1>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/40 text-sm">Logged in as</p>
            <p className="text-lg font-medium">{userProfile?.email}</p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold">My Subscriptions & Purchases</h2>
          
          {entitlements.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-2xl bg-white/5 border border-dashed border-white/20">
              <p className="text-white/40">You don&apos;t have any active subscriptions yet.</p>
              <Link href="/signup" className="mt-4 inline-block text-blue-400 hover:underline">Explore Plans</Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {entitlements.map((e) => (
                <div key={e.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                      {getItemIcon(e.itemType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{e.name}</p>
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium capitalize", getItemTypeBadge(e.itemType))}>
                          {e.itemType}
                        </span>
                      </div>
                      {e.description && (
                        <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{e.description}</p>
                      )}
                      {e.price && (
                        <p className="text-xs text-white/30 mt-0.5">{formatPrice(e.price)}/month</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-green-400">Active</p>
                    <p className="text-[10px] text-white/30">Since {new Date(e.startsAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
