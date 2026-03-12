'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserAuthContext } from '@/components/user-auth-provider';

interface Subscription {
  id: string;
  subsiteId: string | null;
  status: string;
  maxDevices: number | null;
  hasAds: boolean | null;
  startsAt: string;
  subsite: { name: string } | null;
  bundle: { name: string } | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const { userProfile, isAuthenticated, loading: authLoading } = useUserAuthContext();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/settings');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchSubs = async () => {
        try {
          const res = await fetch('/api/user/subscriptions');
          if (res.ok) setSubscriptions(await res.json());
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchSubs();
    }
  }, [isAuthenticated]);

  const handleOpenStripePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/checkout/customer-portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Stripe portal is only available after your first subscription payment.');
        setPortalLoading(false);
      }
    } catch (err) {
      console.error(err);
      setPortalLoading(false);
    }
  };

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
        <div className="flex items-center gap-4">
          <Link href="/account" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">Account Details</h2>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div>
              <p className="text-xs text-white/30 mb-1">Email Address</p>
              <p className="font-medium">{userProfile?.email}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">Subscriptions</h2>
            <button 
              onClick={handleOpenStripePortal}
              disabled={portalLoading}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              {portalLoading ? 'Opening...' : 'Manage Billing & Plans'}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3">
            {subscriptions.length === 0 ? (
              <p className="text-white/30 text-center py-8 bg-white/5 rounded-2xl border border-dashed border-white/10">No active subscriptions found.</p>
            ) : (
              subscriptions.map((s) => (
                <div key={s.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold">{s.subsite?.name || s.bundle?.name}</p>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <span>{s.status.toUpperCase()}</span>
                      {s.subsiteId && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-white/10" />
                          <span>{s.maxDevices} Devices</span>
                          <span className="w-1 h-1 rounded-full bg-white/10" />
                          <span>{s.hasAds ? 'With Ads' : 'No Ads'}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Link href={`/subscribe?modify=${s.subsiteId}`} className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                      Change Options
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-4">
            <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider">Danger Zone</h2>
            <p className="text-xs text-white/40 leading-relaxed">
              Managing your data, account deactivation and platform-wide subscription cancellations can be handled through our support team or the Billing Portal.
            </p>
            <button 
              onClick={handleOpenStripePortal}
              className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold border border-red-500/20 transition-all"
            >
              Cancel Subscriptions
            </button>
        </section>
      </main>
    </div>
  );
}
