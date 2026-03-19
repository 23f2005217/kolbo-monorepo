'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubscriptionStore } from '@/stores/subscription-store';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  planType: string | null;
  tier: string | null;
  maxDevices: number | null;
  hasAds: boolean;
  priceAmount: number | null;
  isActive: boolean;
}

interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthlyPrice: number | null;
  baseDevices?: number | null;
  extraDevicePrice?: number | null;
  maxTotalDevices?: number | null;
  withAdsDiscount?: number | null;
  category: string | null;
  thumbnailStorageBucket: string | null;
  thumbnailStoragePath: string | null;
}

interface ChannelConfig {
  subsiteId: string;
  devices: number;
  hasAds: boolean;
  calculatedPriceCents: number;
}

interface Bundle {
  id: string;
  name: string;
  description: string | null;
  priceAmount: number | null;
  originalPrice: number | null;
  discountPercent: number | null;
  baseDevices?: number | null;
  extraDevicePrice?: number | null;
  maxTotalDevices?: number | null;
  bundleSubsites: { subsite: Channel }[];
}

const CATEGORIES = ['All', 'Kids', 'Education', 'Entertainment', 'Music', 'Lifestyle'];

function formatPrice(cents: number | null | undefined) {
  if (!cents && cents !== 0) return '$0.00';
  return `$${(Math.abs(cents) / 100).toFixed(2)}`;
}

function calcChannelPrice(ch: Channel, devices: number, hasAds: boolean): number {
  let p = ch.monthlyPrice || 0;
  const base = ch.baseDevices || 3;
  if (devices > base) {
    p += (devices - base) * (ch.extraDevicePrice || 0);
  }
  if (hasAds) p -= ch.withAdsDiscount || 0;
  return Math.max(0, p);
}

function CheckIcon({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function SubscriptionContent() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    selectedStreams,
    setSelectedStreams,
    selectedExperience,
    setSelectedExperience,
    selectedChannels,
    setChannelConfig,
    removeChannelConfig,
    selectedBundles,
    setSelectedBundles,
    discountCode,
    setDiscountCode,
  } = useSubscriptionStore();

  const [channelTab, setChannelTab] = useState<'pick' | 'bundles'>('pick');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [channelSearch, setChannelSearch] = useState('');
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [plansRes, channelsRes, bundlesRes] = await Promise.all([
          fetch('/api/subscription-plans'),
          fetch('/api/subsites'),
          fetch('/api/bundles'),
        ]);
        if (plansRes.ok) setPlans(await plansRes.json());
        if (channelsRes.ok) {
          const all = await channelsRes.json();
          setChannels(all.filter((c: Channel) => c.slug !== 'none'));
        }
        if (bundlesRes.ok) setBundles(await bundlesRes.json());
      } catch (err) {
        console.error('[SubscriptionPage] Error loading data:', err);
      }
    };
    load();

    // Load user subscriptions if authenticated
    const loadUserSubs = async () => {
      try {
        const subsRes = await fetch('/api/user/subscriptions');
        if (subsRes.ok) {
          const subs = await subsRes.json();
          setUserSubscriptions(subs);
          setIsAuthenticated(true);
          console.log('[SubscribePage] Loaded user subscriptions:', subs.length);
        }
      } catch (err) {
        console.log('[SubscribePage] User not authenticated or error loading subs');
      }
    };
    loadUserSubs().finally(() => setLoading(false));
  }, []);

  const streamPlans = plans.filter((p) => p.planType === 'streams');
  const experiencePlans = plans.filter((p) => p.planType === 'experience');

  const selectedStreamPlan = plans.find((p) => p.id === selectedStreams?.id);
  const selectedExpPlan = plans.find((p) => p.id === selectedExperience?.id);

  useEffect(() => {
    if (streamPlans.length > 0 && !selectedStreams) {
      const defaultPlan = streamPlans.find((p) => p.tier === 'standard');
      if (defaultPlan) setSelectedStreams({ id: defaultPlan.id, devices: 3 });
    }
    if (experiencePlans.length > 0 && !selectedExperience) {
      const defaultPlan = experiencePlans.find((p) => p.tier === 'standard');
      if (defaultPlan) setSelectedExperience({ id: defaultPlan.id, hasAds: false });
    }
  }, [plans]);

  const filteredChannels = useMemo(() => {
    let filtered = channels;
    if (categoryFilter !== 'All') {
      filtered = filtered.filter((c) => c.category === categoryFilter);
    }
    if (channelSearch.trim()) {
      const q = channelSearch.toLowerCase();
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [channels, categoryFilter, channelSearch]);

  const searchParams = useSearchParams();
  const modifyId = searchParams.get('modify');

  useEffect(() => {
    if (modifyId && !loading) {
      // Find existing subscription for this channel
      const existingSub = userSubscriptions.find((s) => s.subsiteId === modifyId);
      
      if (existingSub) {
        // Load existing settings into the store
        const ch = channels.find((c) => c.id === modifyId);
        if (ch) {
          setChannelConfig({
            subsiteId: modifyId,
            devices: existingSub.maxDevices || 3,
            hasAds: existingSub.hasAds || false,
            calculatedPriceCents: calcChannelPrice(ch, existingSub.maxDevices || 3, existingSub.hasAds || false),
          });
          console.log('[SubscribePage] Loaded existing settings for channel:', modifyId, existingSub);
        }
      }
      
      // Scroll to channel
      const el = document.getElementById(`channel-${modifyId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-blue-500', 'ring-offset-4', 'ring-offset-[#0a0b14]');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-4', 'ring-offset-[#0a0b14]');
        }, 3000);
      }
    }
  }, [modifyId, loading, userSubscriptions, channels, setChannelConfig]);

  const toggleChannel = (id: string) => {
    const ch = channels.find((c) => c.id === id);
    if (!ch) return;
    const existing = selectedChannels.find((c: ChannelConfig) => c.subsiteId === id);
    if (existing) {
      removeChannelConfig(id);
    } else {
      const initialPrice = calcChannelPrice(ch, 3, false);
      setChannelConfig({
        subsiteId: id,
        devices: 3,
        hasAds: false,
        calculatedPriceCents: initialPrice,
      });
    }
  };

  const toggleBundle = (id: string) => {
    const isSelected = selectedBundles.some(b => b.id === id);
    if (isSelected) {
      setSelectedBundles(selectedBundles.filter((b) => b.id !== id));
    } else {
      setSelectedBundles([...selectedBundles, { id, devices: 3 }]);
    }
  };

  const monthlyTotal = useMemo(() => {
    let total = 0;
    if (selectedStreamPlan?.priceAmount) {
      let p = selectedStreamPlan.priceAmount;
      if (selectedStreams?.devices && selectedStreamPlan.maxDevices) {
        if (selectedStreams.devices > selectedStreamPlan.maxDevices) {
          p += (selectedStreams.devices - selectedStreamPlan.maxDevices) * 200; // Legacy or default extra price
        }
      }
      total += p;
    }
    if (selectedExpPlan?.priceAmount) total += selectedExpPlan.priceAmount;

    const bundledChannelIds = new Set<string>();
    selectedBundles.forEach((bConfig) => {
      const bundle = bundles.find((b) => b.id === bConfig.id);
      if (bundle) {
        let p = bundle.priceAmount || 0;
        const base = bundle.baseDevices || 3;
        if (bConfig.devices > base) {
          p += (bConfig.devices - base) * (bundle.extraDevicePrice || 0);
        }
        total += p;
        bundle.bundleSubsites.forEach((bs) => bundledChannelIds.add(bs.subsite.id));
      }
    });

    selectedChannels.forEach((cfg: ChannelConfig) => {
      if (!bundledChannelIds.has(cfg.subsiteId)) {
        total += cfg.calculatedPriceCents || 0;
      }
    });

    return total;
  }, [selectedStreamPlan, selectedExpPlan, selectedChannels, selectedBundles, bundles, selectedStreams]);

  const getThumbnailUrl = (ch: Channel) => {
    if (ch.thumbnailStorageBucket && ch.thumbnailStoragePath) {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${ch.thumbnailStorageBucket}/${ch.thumbnailStoragePath}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0b14]">
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
      </header>

      <div className="flex justify-center py-6">
        <div className="flex items-center gap-0">
          {[
            { num: 1, label: 'Account' },
            { num: 2, label: 'Channels' },
            { num: 3, label: 'Review' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              {i > 0 && (
                <div
                  className={`w-16 h-0.5 ${
                    step > i ? 'bg-green-500' : 'bg-white/20'
                  }`}
                />
              )}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step > s.num
                      ? 'bg-green-500 text-white'
                      : step === s.num
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/20 text-white/60'
                  }`}
                >
                  {step > s.num ? <CheckIcon className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-xs ${step >= s.num ? 'text-green-400' : 'text-white/40'}`}>
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-32">
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Account Set up</h1>
              <p className="text-white/50">
                Select the settings that best fit your needs and fit your budget
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
                <h3 className="text-lg font-semibold">Streams</h3>
                <div className="flex gap-3">
                  {streamPlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedStreams({ id: plan.id, devices: 3 })}
                      className={`flex-1 rounded-lg p-3 border-2 transition-all ${
                        selectedStreams?.id === plan.id
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">
                        {plan.tier}
                      </span>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div className="text-left">
                          <p className="font-semibold text-sm">{plan.name}</p>
                          <p className="text-[11px] text-white/40">{plan.description}</p>
                        </div>
                      </div>
                      {selectedStreams?.id === plan.id && (
                        <div className="flex justify-end mt-1">
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckIcon />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
                <h3 className="text-lg font-semibold">Experience</h3>
                <div className="flex gap-3">
                  {experiencePlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedExperience({ id: plan.id, hasAds: false })}
                      className={`flex-1 rounded-lg p-3 border-2 transition-all ${
                        selectedExperience?.id === plan.id
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">
                        {plan.tier}
                      </span>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-left">
                          <p className="font-semibold text-sm">{plan.name}</p>
                          <p className="text-[11px] text-white/40">{plan.description}</p>
                        </div>
                      </div>
                      {selectedExperience?.id === plan.id && (
                        <div className="flex justify-end mt-1">
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckIcon />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center space-y-2 pt-4">
              <h2 className="text-2xl font-bold">Choose Your Channels</h2>
              <p className="text-white/50">
                Select bundles for the best value, or pick individual channels
              </p>
            </div>

            <div className="flex justify-center">
              <div className="inline-flex rounded-full bg-white/10 p-1">
                <button
                  onClick={() => setChannelTab('pick')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    channelTab === 'pick' ? 'bg-white text-black' : 'text-white/70 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Pick Your Channels
                </button>
                <button
                  onClick={() => setChannelTab('bundles')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    channelTab === 'bundles' ? 'bg-white text-black' : 'text-white/70 hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Bundles
                </button>
              </div>
            </div>

            {channelTab === 'pick' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search channels..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500"
                      value={channelSearch}
                      onChange={(e) => setChannelSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          categoryFilter === cat
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredChannels.map((ch) => {
                    const isSelected = selectedChannels.some((c: ChannelConfig) => c.subsiteId === ch.id);
                    const chConfig = selectedChannels.find((c: ChannelConfig) => c.subsiteId === ch.id);
                    const thumbUrl = getThumbnailUrl(ch);
                    return (
                      <div
                        key={ch.id}
                        id={`channel-${ch.id}`}
                        onClick={() => toggleChannel(ch.id)}
                        className={`relative rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-green-500 bg-green-500/5'
                            : 'border-white/10 bg-white/5 hover:border-white/30'
                        }`}
                      >
                        <div className="absolute top-3 right-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected ? 'border-green-500 bg-green-500' : 'border-white/30'
                            }`}
                          >
                            {isSelected && <CheckIcon />}
                          </div>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center mb-3 overflow-hidden">
                          {thumbUrl ? (
                            <img src={thumbUrl} alt={ch.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg font-bold text-white/60">
                              {ch.name.charAt(0)}
                            </span>
                          )}
                        </div>

                        <p className="font-semibold text-sm">{ch.name}</p>
                        <p className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5">
                          {ch.category || 'General'}
                        </p>
                        {ch.description && (
                          <p className="text-xs text-white/40 mt-1 line-clamp-2">{ch.description}</p>
                        )}
                        {isSelected && chConfig && (
                          <div className="mt-3 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={chConfig.devices}
                              onChange={(e) => {
                                const devices = parseInt(e.target.value);
                                setChannelConfig({
                                  ...chConfig,
                                  devices,
                                  calculatedPriceCents: calcChannelPrice(ch, devices, chConfig.hasAds),
                                });
                              }}
                              className="w-full text-xs bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
                            >
                              {[3, 4, 5, 6, 7, 8, 9, 10].filter(d => d <= (ch.maxTotalDevices || 10)).map(d => {
                                const base = ch.baseDevices || 3;
                                const extra = d > base ? (d - base) * (ch.extraDevicePrice || 0) : 0;
                                return (
                                  <option key={d} value={d}>
                                    {d} Devices {extra > 0 ? `(+${formatPrice(extra)})` : ''}
                                  </option>
                                );
                              })}
                            </select>
                            <select
                              value={chConfig.hasAds ? 'ads' : 'no-ads'}
                              onChange={(e) => {
                                const hasAds = e.target.value === 'ads';
                                setChannelConfig({
                                  ...chConfig,
                                  hasAds,
                                  calculatedPriceCents: calcChannelPrice(ch, chConfig.devices, hasAds),
                                });
                              }}
                              className="w-full text-xs bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
                            >
                              <option value="no-ads">No Ads</option>
                              <option value="ads">With Ads (-{formatPrice(ch.withAdsDiscount || 0)})</option>
                            </select>
                            <p className="text-right text-sm font-bold text-green-400">
                              {formatPrice(chConfig.calculatedPriceCents)}/mo
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {bundles.map((bundle) => {
                  const bConfig = selectedBundles.find(b => b.id === bundle.id);
                  const isSelected = !!bConfig;
                  return (
                    <div
                      key={bundle.id}
                      className={`rounded-xl border-2 p-6 transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-500/5'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/30 to-orange-500/30 flex items-center justify-center">
                              <span className="text-lg">
                                {bundle.name.includes('Kids') ? '🧒' : bundle.name.includes('Education') ? '📚' : '🎬'}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{bundle.name}</h3>
                              <p className="text-xs text-white/40">
                                {bundle.bundleSubsites.length} channels for the whole family
                              </p>
                            </div>
                          </div>
                          {bundle.description && (
                            <p className="text-sm text-white/50 mt-2 mb-3">{bundle.description}</p>
                          )}
                          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                            {bundle.bundleSubsites.map((bs) => (
                              <div key={bs.subsite.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center">
                                    <span className="text-[8px] font-bold text-white/60">
                                      {bs.subsite.name.charAt(0)}
                                    </span>
                                  </div>
                                  <span className="text-white/80">{bs.subsite.name}</span>
                                </div>
                                <span className="text-white/40">
                                  {bs.subsite.monthlyPrice ? formatPrice(bs.subsite.monthlyPrice) : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                          {bundle.originalPrice && bundle.priceAmount && (
                            <p className="text-xs text-green-400 mt-3 flex items-center gap-1">
                              <CheckIcon className="w-3 h-3" />
                              Save {formatPrice(bundle.originalPrice - bundle.priceAmount)}/month compared to individual subscriptions
                            </p>
                          )}
                        </div>

                        <div className="text-right ml-6 shrink-0">
                          {bundle.originalPrice && (
                            <p className="text-sm text-white/40 line-through">
                              {formatPrice(bundle.originalPrice)}/mo
                            </p>
                          )}
                          <p className="text-3xl font-bold">
                            {formatPrice(bundle.priceAmount)}
                            <span className="text-base font-normal text-white/50">/month</span>
                          </p>
                          {bundle.discountPercent && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                              Save {bundle.discountPercent}%
                            </span>
                          )}
                          <button
                            onClick={() => toggleBundle(bundle.id)}
                            className={`mt-3 w-full px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                              isSelected
                                ? 'bg-green-500 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <CheckIcon className="w-4 h-4" />
                                Subscribed
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Subscribe to Bundle
                              </>
                            )}
                          </button>
                          <p className="text-[10px] text-white/30 mt-1">Cancel anytime</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Review Your Order</h1>
              <p className="text-white/50">
                Double-check your selections before completing signup
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Plan Options
              </h3>
              <div className="flex gap-6">
                {selectedStreamPlan && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Streams</p>
                      <p className="text-xs text-white/50 bg-blue-500/10 px-2 py-0.5 rounded mt-0.5">{selectedStreamPlan.name}</p>
                    </div>
                  </div>
                )}
                {selectedExpPlan && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Experience</p>
                      <p className="text-xs text-white/50 bg-blue-500/10 px-2 py-0.5 rounded mt-0.5">{selectedExpPlan.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Your Channels
              </h3>

              {selectedBundles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-white/40">Bundles</p>
                  {selectedBundles.map((bConfig) => {
                    const bundle = bundles.find((b) => b.id === bConfig.id);
                    if (!bundle) return null;
                    const base = bundle.baseDevices || 3;
                    const price = (bundle.priceAmount || 0) + (bConfig.devices > base ? (bConfig.devices - base) * (bundle.extraDevicePrice || 0) : 0);
                    return (
                      <div key={bundle.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/30 to-orange-500/30 flex items-center justify-center text-sm">
                            {bundle.name.includes('Kids') ? '🧒' : bundle.name.includes('Education') ? '📚' : '🎬'}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{bundle.name}</p>
                            <p className="text-[10px] text-white/40">
                              {bundle.bundleSubsites.length} channels · {bConfig.devices} devices
                            </p>
                          </div>
                        </div>
                        <span className="text-sm">{formatPrice(price)}/mo</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedChannels.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-white/40">Individual Channels</p>
                  {selectedChannels.map((cfg: ChannelConfig) => {
                    const ch = channels.find((c) => c.id === cfg.subsiteId);
                    if (!ch) return null;
                    return (
                      <div key={ch.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-white/60">{ch.name.charAt(0)}</span>
                          </div>
                          <div>
                            <span className="text-sm text-white/80">{ch.name}</span>
                            <span className="text-[10px] text-white/40 ml-2">
                              {cfg.devices} devices{cfg.hasAds ? ', with ads' : ''}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm text-white/50">{formatPrice(cfg.calculatedPriceCents)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedBundles.length === 0 && selectedChannels.length === 0 && (
                <p className="text-sm text-white/40 text-center py-2">No channels selected</p>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Discount Code
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter discount code"
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <button className="px-4 py-2 rounded-lg bg-white/10 text-sm font-medium hover:bg-white/20 transition-colors">
                  Apply
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Pricing Summary
              </h3>
              <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                <span className="text-white/60">Monthly Total</span>
                <span className="text-2xl font-bold">{formatPrice(monthlyTotal)}/mo</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0b14]/95 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40">Monthly Total</p>
            <p className="text-2xl font-bold">{formatPrice(monthlyTotal)}/mo</p>
            <p className="text-[11px] text-white/40">
              Includes {selectedStreamPlan?.maxDevices || 0} devices
              {selectedExpPlan?.hasAds ? ' · with ads' : ' · no ads'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}
            {step < 2 ? (
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                Review Order
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => router.push('/checkout')}
                className="px-6 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                Complete Order
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  );
}
