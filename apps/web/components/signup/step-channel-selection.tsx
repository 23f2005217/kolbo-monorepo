"use client";

import { useMemo, useState } from "react";
import { CheckIcon } from "./check-icon";
import { CATEGORIES } from "./constants";
import { formatPrice, calcChannelPrice } from "./utils";
import type { Plan, Channel, ChannelConfig, Bundle, SelectedStream, SelectedExperience, SelectedBundle } from "./types";

interface StepChannelSelectionProps {
  dataLoading: boolean;
  streamPlans: Plan[];
  experiencePlans: Plan[];
  channels: Channel[];
  bundles: Bundle[];
  selectedStreams: SelectedStream | null;
  setSelectedStreams: (s: SelectedStream) => void;
  selectedExperience: SelectedExperience | null;
  setSelectedExperience: (e: SelectedExperience) => void;
  selectedChannels: ChannelConfig[];
  setChannelConfig: (c: ChannelConfig) => void;
  removeChannelConfig: (id: string) => void;
  selectedBundles: SelectedBundle[];
  setSelectedBundles: (b: SelectedBundle[]) => void;
}

export function StepChannelSelection({
  dataLoading,
  streamPlans,
  experiencePlans,
  channels,
  bundles,
  selectedStreams,
  setSelectedStreams,
  selectedExperience,
  setSelectedExperience,
  selectedChannels,
  setChannelConfig,
  removeChannelConfig,
  selectedBundles,
  setSelectedBundles,
}: StepChannelSelectionProps) {
  const [channelTab, setChannelTab] = useState<"pick" | "bundles">("pick");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [channelSearch, setChannelSearch] = useState("");

  const filteredChannels = useMemo(() => {
    let filtered = channels;
    if (categoryFilter !== "All") {
      filtered = filtered.filter((c) => c.category === categoryFilter);
    }
    if (channelSearch.trim()) {
      const q = channelSearch.toLowerCase();
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [channels, categoryFilter, channelSearch]);

  const toggleChannel = (id: string) => {
    const ch = channels.find((c) => c.id === id);
    if (!ch) return;
    const existing = selectedChannels.find((c) => c.subsiteId === id);
    if (existing) {
      removeChannelConfig(id);
    } else {
      const calculated = calcChannelPrice(ch, 3, false);
      setChannelConfig({
        subsiteId: id,
        devices: 3,
        hasAds: false,
        calculatedPriceCents: calculated,
      });
    }
  };

  const toggleBundle = (id: string) => {
    const isSelected = selectedBundles.some((b) => b.id === id);
    const next = isSelected
      ? selectedBundles.filter((b) => b.id !== id)
      : [...selectedBundles, { id, devices: bundles.find((b) => b.id === id)?.baseDevices || 3 }];
    setSelectedBundles(next);
  };

  if (dataLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Account Set up</h1>
        <p className="text-white/50">
          Select the settings that best fit your needs and fit your budget
        </p>
      </div>

      {/* Streams & Experience Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StreamsPlanSelector
          plans={streamPlans}
          selectedId={selectedStreams?.id ?? null}
          onSelect={(plan) => setSelectedStreams({ id: plan.id, devices: plan.maxDevices || 3 })}
        />
        <ExperiencePlanSelector
          plans={experiencePlans}
          selectedId={selectedExperience?.id ?? null}
          onSelect={(plan) => setSelectedExperience({ id: plan.id, hasAds: plan.hasAds })}
        />
      </div>

      {/* Channel Selection Header */}
      <div className="text-center space-y-2 pt-4">
        <h2 className="text-2xl font-bold">Choose Your Channels</h2>
        <p className="text-white/50">
          Select bundles for the best value, or pick individual channels
        </p>
      </div>

      {/* Channel Tab Switcher */}
      <ChannelTabSwitcher tab={channelTab} onTabChange={setChannelTab} />

      {channelTab === "pick" ? (
        <ChannelPicker
          channels={filteredChannels}
          selectedChannels={selectedChannels}
          categoryFilter={categoryFilter}
          channelSearch={channelSearch}
          onCategoryChange={setCategoryFilter}
          onSearchChange={setChannelSearch}
          onToggleChannel={toggleChannel}
          onUpdateConfig={setChannelConfig}
        />
      ) : (
        <BundlePicker
          bundles={bundles}
          selectedBundles={selectedBundles}
          onToggleBundle={toggleBundle}
        />
      )}
    </>
  );
}

function StreamsPlanSelector({
  plans,
  selectedId,
  onSelect,
}: {
  plans: Plan[];
  selectedId: string | null;
  onSelect: (plan: Plan) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
      <h3 className="text-lg font-semibold">Streams</h3>
      <div className="flex gap-3">
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => onSelect(plan)}
            className={`flex-1 rounded-lg p-3 border-2 transition-all ${
              selectedId === plan.id
                ? "border-green-500 bg-green-500/10"
                : "border-white/10 hover:border-white/30"
            }`}
          >
            <span className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">
              {plan.tier}
            </span>
            <div className="flex items-center gap-2">
              <MonitorIcon />
              <div className="text-left">
                <p className="font-semibold text-sm">{plan.name}</p>
                <p className="text-[11px] text-white/40">{plan.description}</p>
              </div>
            </div>
            {selectedId === plan.id && (
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
  );
}

function ExperiencePlanSelector({
  plans,
  selectedId,
  onSelect,
}: {
  plans: Plan[];
  selectedId: string | null;
  onSelect: (plan: Plan) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
      <h3 className="text-lg font-semibold">Experience</h3>
      <div className="flex gap-3">
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => onSelect(plan)}
            className={`flex-1 rounded-lg p-3 border-2 transition-all ${
              selectedId === plan.id
                ? "border-green-500 bg-green-500/10"
                : "border-white/10 hover:border-white/30"
            }`}
          >
            <span className="block text-[10px] uppercase tracking-wider text-white/50 mb-1">
              {plan.tier}
            </span>
            <div className="flex items-center gap-2">
              <PlayIcon />
              <div className="text-left">
                <p className="font-semibold text-sm">{plan.name}</p>
                <p className="text-[11px] text-white/40">{plan.description}</p>
              </div>
            </div>
            {selectedId === plan.id && (
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
  );
}

function ChannelTabSwitcher({
  tab,
  onTabChange,
}: {
  tab: "pick" | "bundles";
  onTabChange: (t: "pick" | "bundles") => void;
}) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-full bg-white/10 p-1">
        <button
          onClick={() => onTabChange("pick")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            tab === "pick" ? "bg-white text-black" : "text-white/70 hover:text-white"
          }`}
        >
          <GridIcon />
          Pick Your Channels
        </button>
        <button
          onClick={() => onTabChange("bundles")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            tab === "bundles" ? "bg-white text-black" : "text-white/70 hover:text-white"
          }`}
        >
          <BundleIcon />
          Bundles
        </button>
      </div>
    </div>
  );
}

function ChannelPicker({
  channels,
  selectedChannels,
  categoryFilter,
  channelSearch,
  onCategoryChange,
  onSearchChange,
  onToggleChannel,
  onUpdateConfig,
}: {
  channels: Channel[];
  selectedChannels: ChannelConfig[];
  categoryFilter: string;
  channelSearch: string;
  onCategoryChange: (cat: string) => void;
  onSearchChange: (q: string) => void;
  onToggleChannel: (id: string) => void;
  onUpdateConfig: (c: ChannelConfig) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search channels..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/10 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500"
            value={channelSearch}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {channels.map((ch) => {
          const isSelected = selectedChannels.some((c) => c.subsiteId === ch.id);
          const chConfig = selectedChannels.find((c) => c.subsiteId === ch.id);
          const thumbUrl =
            ch.thumbnailStorageBucket && ch.thumbnailStoragePath
              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${ch.thumbnailStorageBucket}/${ch.thumbnailStoragePath}`
              : null;
          return (
            <div
              key={ch.id}
              onClick={() => onToggleChannel(ch.id)}
              className={`relative rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-green-500 bg-green-500/5"
                  : "border-white/10 bg-white/5 hover:border-white/30"
              }`}
            >
              <div className="absolute top-3 right-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? "border-green-500 bg-green-500" : "border-white/30"
                  }`}
                >
                  {isSelected && <CheckIcon />}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center mb-3 overflow-hidden">
                {thumbUrl ? (
                  <img src={thumbUrl} alt={ch.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-white/60">{ch.name.charAt(0)}</span>
                )}
              </div>
              <p className="font-semibold text-sm">{ch.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5">
                {ch.category || "General"}
              </p>
              {ch.description && (
                <p className="text-xs text-white/40 mt-1 line-clamp-2">{ch.description}</p>
              )}
              {isSelected && chConfig && (
                <ChannelConfigForm
                  channel={ch}
                  config={chConfig}
                  onUpdate={onUpdateConfig}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChannelConfigForm({
  channel,
  config,
  onUpdate,
}: {
  channel: Channel;
  config: ChannelConfig;
  onUpdate: (c: ChannelConfig) => void;
}) {
  return (
    <div className="mt-3 space-y-1.5" onClick={(e) => e.stopPropagation()}>
      <select
        value={config.devices}
        onChange={(e) => {
          const devices = parseInt(e.target.value);
          onUpdate({
            ...config,
            devices,
            calculatedPriceCents: calcChannelPrice(channel, devices, config.hasAds),
          });
        }}
        className="w-full text-xs bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
      >
        {Array.from({ length: (channel.maxTotalDevices || 10) - (channel.baseDevices || 3) + 1 }).map((_, i) => {
          const num = (channel.baseDevices || 3) + i;
          const extra = num - (channel.baseDevices || 3);
          const extraPrice = extra * (channel.extraDevicePrice || 0);
          return (
            <option key={num} value={num}>
              {num} Devices {extra > 0 ? `(+${formatPrice(extraPrice)})` : "(Base)"}
            </option>
          );
        })}
      </select>
      <select
        value={config.hasAds ? "ads" : "no-ads"}
        onChange={(e) => {
          const hasAds = e.target.value === "ads";
          onUpdate({
            ...config,
            hasAds,
            calculatedPriceCents: calcChannelPrice(channel, config.devices, hasAds),
          });
        }}
        className="w-full text-xs bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
      >
        <option value="no-ads">No Ads</option>
        <option value="ads">With Ads (-{formatPrice(channel.withAdsDiscount || 0)})</option>
      </select>
      <p className="text-right text-sm font-bold text-green-400">
        {formatPrice(config.calculatedPriceCents)}/mo
      </p>
    </div>
  );
}

function BundlePicker({
  bundles,
  selectedBundles,
  onToggleBundle,
}: {
  bundles: Bundle[];
  selectedBundles: SelectedBundle[];
  onToggleBundle: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      {bundles.map((bundle) => {
        const isSelected = selectedBundles.some((b) => b.id === bundle.id);
        return (
          <div
            key={bundle.id}
            className={`rounded-xl border-2 p-6 transition-all ${
              isSelected ? "border-green-500 bg-green-500/5" : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/30 to-orange-500/30 flex items-center justify-center">
                    <span className="text-lg">
                      {bundle.name.includes("Kids") ? "🧒" : bundle.name.includes("Education") ? "📚" : "🎬"}
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
                        {bs.subsite.monthlyPrice ? formatPrice(bs.subsite.monthlyPrice) : ""}
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

              <div className="text-right shrink-0">
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
                  onClick={() => onToggleBundle(bundle.id)}
                  className={`mt-3 w-full px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    isSelected ? "bg-green-500 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckIcon className="w-4 h-4" /> Subscribed
                    </>
                  ) : (
                    <>
                      <PlusIcon />
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
  );
}

// --- Inline SVG Icons ---

function MonitorIcon() {
  return (
    <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function BundleIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
