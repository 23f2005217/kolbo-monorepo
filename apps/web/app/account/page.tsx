'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserAuthContext } from '@/components/user-auth-provider';

interface Entitlement {
  id: string;
  contentType: string;
  contentId: string;
  entitlementType: string;
  startsAt: string;
  expiresAt: string | null;
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
              <p className="text-white/40">You don't have any active subscriptions yet.</p>
              <Link href="/signup" className="mt-4 inline-block text-blue-400 hover:underline">Explore Plans</Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {entitlements.map((e) => (
                <div key={e.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                  <div>
                    <p className="font-semibold capitalize">{e.entitlementType}</p>
                    <p className="text-xs text-white/40">ID: {e.contentId}</p>
                  </div>
                  <div className="text-right">
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
