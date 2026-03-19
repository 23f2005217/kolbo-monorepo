"use client";

import { STEPPER_STEPS } from "./constants";
import { CheckIcon } from "./check-icon";

export function SignupStepper({ step }: { step: number }) {
  return (
    <div className="flex justify-center py-6">
      <div className="flex items-center gap-0">
        {STEPPER_STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center">
            {i > 0 && (
              <div
                className={`w-16 h-0.5 ${
                  step > i ? "bg-green-500" : "bg-white/20"
                }`}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step > s.num
                    ? "bg-green-500 text-white"
                    : step === s.num
                    ? "bg-blue-500 text-white"
                    : "bg-white/20 text-white/60"
                }`}
              >
                {step > s.num ? <CheckIcon className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-xs ${
                  step >= s.num ? "text-green-400" : "text-white/40"
                }`}
              >
                {s.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
