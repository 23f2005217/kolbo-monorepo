"use client";

import { formatPrice } from "./utils";
import type { Plan } from "./types";

interface SignupFooterProps {
  step: number;
  monthlyTotal: number;
  selectedStreamPlan: Plan | undefined;
  selectedExpPlan: Plan | undefined;
  onBack: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export function SignupFooter({
  step,
  monthlyTotal,
  selectedStreamPlan,
  selectedExpPlan,
  onBack,
  onNext,
  onComplete,
}: SignupFooterProps) {
  if (step < 2) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0a0b14]/95 backdrop-blur-sm border-t border-white/10 z-50">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-white/40">Monthly Total</p>
          <p className="text-2xl font-bold">{formatPrice(monthlyTotal)}/mo</p>
          <p className="text-[11px] text-white/40">
            Includes {selectedStreamPlan?.maxDevices || 0} devices
            {selectedExpPlan?.hasAds ? " · with ads" : " · no ads"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors"
          >
            <BackIcon />
            Back
          </button>
          {step === 2 ? (
            <button
              onClick={onNext}
              className="px-6 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              Review Order
              <ForwardIcon />
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="px-6 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              Complete Order
              <ForwardIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ForwardIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
