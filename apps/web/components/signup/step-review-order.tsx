"use client";

import { CheckIcon } from "./check-icon";
import { formatPrice } from "./utils";
import type { Plan, Channel, ChannelConfig, Bundle, SelectedBundle } from "./types";

interface StepReviewOrderProps {
  selectedStreamPlan: Plan | undefined;
  selectedExpPlan: Plan | undefined;
  selectedChannels: ChannelConfig[];
  selectedBundles: SelectedBundle[];
  bundles: Bundle[];
  channels: Channel[];
  discountCode: string;
  setDiscountCode: (v: string) => void;
  monthlyTotal: number;
}

export function StepReviewOrder({
  selectedStreamPlan,
  selectedExpPlan,
  selectedChannels,
  selectedBundles,
  bundles,
  channels,
  discountCode,
  setDiscountCode,
  monthlyTotal,
}: StepReviewOrderProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Review Your Order</h1>
        <p className="text-white/50">
          Double-check your selections before completing signup
        </p>
      </div>

      {/* Plan Options */}
      <ReviewSection title="Plan Options" icon={<ShieldIcon />}>
        <div className="flex gap-6">
          {selectedStreamPlan && (
            <PlanBadge label="Streams" name={selectedStreamPlan.name} color="blue" icon={<MonitorIcon />} />
          )}
          {selectedExpPlan && (
            <PlanBadge label="Experience" name={selectedExpPlan.name} color="blue" icon={<PlayIcon />} />
          )}
        </div>
      </ReviewSection>

      {/* Your Channels */}
      <ReviewSection title="Your Channels" icon={<BundleIcon />}>
        {selectedBundles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-white/40">Bundles</p>
            {selectedBundles.map((b) => {
              const bundle = bundles.find((bundle) => bundle.id === b.id);
              if (!bundle) return null;
              return (
                <div key={bundle.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/30 to-orange-500/30 flex items-center justify-center text-sm">
                      {bundle.name.includes("Kids") ? "🧒" : bundle.name.includes("Education") ? "📚" : "🎬"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{bundle.name}</p>
                      <p className="text-[10px] text-white/40">
                        {bundle.bundleSubsites.length} channels · {b.devices} devices
                      </p>
                    </div>
                  </div>
                  <span className="text-sm">{formatPrice(bundle.priceAmount)}/mo</span>
                </div>
              );
            })}
          </div>
        )}
        {selectedChannels.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-white/40">Individual Channels</p>
            {selectedChannels.map((cfg) => {
              const ch = channels.find((c) => c.id === cfg.subsiteId);
              if (!ch) return null;
              return (
                <div key={ch.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white/60">{ch.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm">{ch.name}</p>
                      <p className="text-xs text-white/40">
                        {cfg.devices} devices · {cfg.hasAds ? "with ads" : "no ads"}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium text-blue-400">
                    {formatPrice(cfg.calculatedPriceCents)}/mo
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {selectedBundles.length === 0 && selectedChannels.length === 0 && (
          <p className="text-sm text-white/40 text-center py-2">No channels selected</p>
        )}
      </ReviewSection>

      {/* Discount Code */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <TagIcon />
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

      {/* Pricing Summary */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <CalculatorIcon />
          Pricing Summary
        </h3>
        <div className="border-t border-white/10 pt-3 flex items-center justify-between">
          <span className="text-white/60">Monthly Total</span>
          <span className="text-2xl font-bold">{formatPrice(monthlyTotal)}/mo</span>
        </div>
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function PlanBadge({
  label,
  name,
  color,
  icon,
}: {
  label: string;
  name: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <p className={`text-sm font-medium bg-${color}-500/20 text-${color}-400 px-2 py-0.5 rounded`}>
          {label}
        </p>
        <p className={`text-xs text-white/50 bg-${color}-500/10 px-2 py-0.5 rounded mt-0.5`}>
          {name}
        </p>
      </div>
    </div>
  );
}

// --- Icons ---

function ShieldIcon() {
  return (
    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function BundleIcon() {
  return (
    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function CalculatorIcon() {
  return (
    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}
