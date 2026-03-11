'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserAuthContext } from '@/components/user-auth-provider';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { cn } from '@kolbo/ui';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  planType: string | null;
  tier: string | null;
  priceAmount: number | null;
  stripePriceId: string | null;
}

interface Channel {
  id: string;
  name: string;
  monthlyPrice: number | null;
  stripePriceId: string | null;
}

interface Bundle {
  id: string;
  name: string;
  price: number | null;
  stripePriceId: string | null;
  bundleSubsites: { subsite: Channel }[];
}

function formatPrice(cents: number | null | undefined) {
  if (!cents && cents !== 0) return '$0.00';
  return `$${(Math.abs(cents) / 100).toFixed(2)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { userProfile, isAuthenticated, loading: authLoading } = useUserAuthContext();
  const { 
    selectedStreams, 
    selectedExperience, 
    selectedChannels, 
    selectedBundles,
    reset
  } = useSubscriptionStore();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [plansRes, channelsRes, bundlesRes] = await Promise.all([
          fetch('/api/subscription-plans'),
          fetch('/api/subsites'),
          fetch('/api/bundles'),
        ]);
        if (plansRes.ok) setPlans(await plansRes.json());
        if (channelsRes.ok) setChannels(await channelsRes.json());
        if (bundlesRes.ok) setBundles(await bundlesRes.json());
      } catch (err) {
        console.error('Error loading checkout data:', err);
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, []);

  const selectedStreamPlan = useMemo(() => plans.find(p => p.id === selectedStreams), [plans, selectedStreams]);
  const selectedExpPlan = useMemo(() => plans.find(p => p.id === selectedExperience), [plans, selectedExperience]);
  const selectedChannelItems = useMemo(() => channels.filter(c => selectedChannels.includes(c.id)), [channels, selectedChannels]);
  const selectedBundleItems = useMemo(() => bundles.filter(b => selectedBundles.includes(b.id)), [bundles, selectedBundles]);

  const monthlyTotal = useMemo(() => {
    let total = 0;
    if (selectedStreamPlan?.priceAmount) total += selectedStreamPlan.priceAmount;
    if (selectedExpPlan?.priceAmount) total += selectedExpPlan.priceAmount;

    const bundledChannelIds = new Set<string>();
    selectedBundleItems.forEach(bundle => {
      total += bundle.price || 0;
      bundle.bundleSubsites.forEach(bs => bundledChannelIds.add(bs.subsite.id));
    });

    selectedChannelItems.forEach(ch => {
      if (!bundledChannelIds.has(ch.id)) {
        total += ch.monthlyPrice || 0;
      }
    });

    return total;
  }, [selectedStreamPlan, selectedExpPlan, selectedChannelItems, selectedBundleItems]);

  const handlePayment = async () => {
    if (!isAuthenticated) return;
    
    setProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/checkout/create-subscription-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile?.id,
          planIds: [selectedStreams, selectedExperience].filter(Boolean),
          channelIds: selectedChannels,
          bundleIds: selectedBundles,
          successUrl: `${window.location.origin}/account?status=success`,
          cancelUrl: `${window.location.origin}/checkout?status=cancel`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate checkout');

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  if (authLoading || dataLoading) {
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
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/40">{userProfile?.email}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-white/50">Complete your subscription to start watching.</p>
          </div>

          <div className="space-y-6">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">Selected Plans</h3>
              <div className="space-y-3">
                {[selectedStreamPlan, selectedExpPlan].filter(Boolean).map((plan) => (
                  <div key={plan!.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <p className="font-semibold">{plan!.name}</p>
                      <p className="text-xs text-white/40">{plan!.planType === 'streams' ? 'Streaming Plan' : 'Experience Plan'}</p>
                    </div>
                    <span className="font-medium text-blue-400">{formatPrice(plan!.priceAmount)}/mo</span>
                  </div>
                ))}
              </div>
            </section>

            {(selectedChannelItems.length > 0 || selectedBundleItems.length > 0) && (
              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">Channels & Bundles</h3>
                <div className="space-y-3">
                  {selectedBundleItems.map((bundle) => (
                    <div key={bundle.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
                      <div>
                        <p className="font-semibold">{bundle.name}</p>
                        <p className="text-xs text-white/40">{bundle.bundleSubsites.length} Channels</p>
                      </div>
                      <span className="font-medium text-blue-400">{formatPrice(bundle.price)}/mo</span>
                    </div>
                  ))}
                  {selectedChannelItems.map((ch) => {
                     // Only show if not part of a bundle
                     const inBundle = selectedBundleItems.some(b => b.bundleSubsites.some(bs => bs.subsite.id === ch.id));
                     if (inBundle) return null;
                     return (
                        <div key={ch.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10">
                          <div>
                            <p className="font-semibold">{ch.name}</p>
                            <p className="text-xs text-white/40">Individual Channel</p>
                          </div>
                          <span className="font-medium text-blue-400">{formatPrice(ch.monthlyPrice)}/mo</span>
                        </div>
                     );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6 sticky top-8">
            <h3 className="text-lg font-bold mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6 pb-6 border-b border-white/10 text-sm">
              <div className="flex justify-between text-white/60">
                <span>Monthly Subtotal</span>
                <span>{formatPrice(monthlyTotal)}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold">Monthly Total</span>
              <span className="text-3xl font-bold text-blue-400">{formatPrice(monthlyTotal)}</span>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-6 font-medium">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={processing || monthlyTotal === 0}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Pay Securely with Stripe
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-white/30 mt-4 leading-relaxed">
              By completing your purchase, you agree to our Terms of Service and Privacy Policy. 
              Subscriptions will automatically renew unless cancelled.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
