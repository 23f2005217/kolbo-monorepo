'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserAuthContext } from '@/components/user-auth-provider';
import { cn } from '@kolbo/ui';

interface UserSubscription {
  id: string;
  subsiteId: string | null;
  bundleId: string | null;
  status: string;
  maxDevices: number | null;
  hasAds: boolean | null;
  startsAt: string;
  subsite: {
    name: string;
    slug: string;
    monthlyPrice: number | null;
    thumbnailStorageBucket: string | null;
    thumbnailStoragePath: string | null;
  } | null;
  bundle: {
    name: string;
    priceAmount: number | null;
  } | null;
}

function formatPrice(cents: number | null | undefined) {
  if (!cents && cents !== 0) return '$0.00';
  return `$${(Math.abs(cents) / 100).toFixed(2)}`;
}

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('status') === 'success';
  const { userProfile, isAuthenticated, loading: authLoading, logout } = useUserAuthContext();
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchSubscriptions = async () => {
        try {
          const res = await fetch('/api/user/subscriptions');
          if (res.ok) {
            setSubscriptions(await res.json());
          }
        } catch (err) {
          console.error('Error fetching subscriptions:', err);
        } finally {
          setLoading(false);
        }
      };
      
      // If we just got a success, maybe wait a tiny bit for webhook
      if (isSuccess) {
        setLoading(true);
        setTimeout(fetchSubscriptions, 1500);
      } else {
        fetchSubscriptions();
      }
    }
  }, [isAuthenticated, isSuccess]);

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
          <span className="flex size-5 items-center justify-center rounded bg-white/90 text-[#0a0b14]">
            <svg viewBox="0 0 24 24" className="size-3" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/settings" className="text-sm border border-white/10 px-4 py-1.5 rounded-full hover:bg-white/5 transition-all">Settings</Link>
          <button onClick={logout} className="text-sm text-white/60 hover:text-white transition-colors">Sign out</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {isSuccess && (
          <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-400">Payment Successful!</h3>
              <p className="text-white/60 text-sm">Your subscription has been activated and your account is ready to use.</p>
            </div>
          </div>
        )}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">My Account</h1>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-white/40 text-sm">Logged in as</p>
              <p className="text-lg font-medium">{userProfile?.email}</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Active Subscriptions</h2>
            <Link href="/subscribe" className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
              Add More
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
          
          {subscriptions.length === 0 ? (
            <div className="text-center py-16 p-6 rounded-2xl bg-white/5 border border-dashed border-white/20">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-white/40">You don&apos;t have any active subscriptions yet.</p>
              <Link href="/signup" className="mt-4 inline-block px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-sm font-semibold transition-all">Explore Plans</Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {subscriptions.map((s) => (
                <div key={s.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center group hover:border-white/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden border border-white/10">
                      {s.subsite?.thumbnailStoragePath ? (
                        <img 
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${s.subsite.thumbnailStorageBucket}/${s.subsite.thumbnailStoragePath}`}
                          alt={s.subsite.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-white/40">
                          {(s.subsite?.name || s.bundle?.name || '?').charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">{s.subsite?.name || s.bundle?.name}</p>
                        <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-white/50">
                          {s.subsiteId ? (
                            <>
                              {s.maxDevices} Devices · {s.hasAds ? 'With Ads' : 'No Ads'}
                            </>
                          ) : 'Bundle Subscription'}
                        </p>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                          {formatPrice(s.subsite?.monthlyPrice || s.bundle?.priceAmount)}/month
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="hidden sm:block">
                      <p className="text-xs text-white/30">Next billing on</p>
                      <p className="text-sm font-medium">{new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}</p>
                    </div>
                    <Link 
                      href="/settings" 
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/5 group-hover:border-white/10"
                    >
                      <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
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

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <AccountContent />
    </Suspense>
  );
}
