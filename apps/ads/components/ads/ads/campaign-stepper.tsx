'use client';

import { Check, Target, DollarSign, Upload, Eye } from 'lucide-react';

interface CampaignStepperProps {
  currentStep: number;
  editMode?: boolean;
}

export function CampaignStepper({ currentStep, editMode }: CampaignStepperProps) {
  const steps = [
    { 
      name: 'Campaign Details', 
      icon: Check,
    },
    { 
      name: 'Targeting', 
      icon: Target,
    },
    { 
      name: 'Budget & Schedule', 
      icon: DollarSign,
    },
    { 
      name: 'Creative', 
      icon: Upload,
    },
  ];

  return (
    <div className="w-full py-10">
      <div className="flex items-center justify-between max-w-3xl mx-auto relative px-10">
        {/* Background line */}
        <div className="absolute top-5 left-20 right-20 h-[2px] bg-white/10 -z-0" />
        
        {/* Active/Completed line */}
        <div 
          className="absolute top-5 left-20 h-[2px] bg-(--ads-cyan) transition-all duration-300 -z-0"
          style={{ width: `${(currentStep / (steps.length - 1)) * (100 - (40 * 2 / 3))}%` }}
        />

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={step.name} className="flex flex-col items-center relative z-10 w-24">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-(--ads-cyan) text-white ring-4 ring-(--ads-cyan)/20 shadow-[0_0_15px_rgba(0,212,255,0.4)]'
                    : isActive
                    ? 'bg-(--ads-dark-primary) border-2 border-(--ads-cyan) text-(--ads-cyan) ring-4 ring-(--ads-cyan)/20 shadow-[0_0_15px_rgba(0,212,255,0.4)]'
                    : 'bg-(--ads-dark-secondary) border border-white/10 text-gray-500'
                }`}
              >
                <Icon style={{ width: 18, height: 18 }} />
              </div>
              <span
                className={`mt-3 text-[10px] font-medium uppercase tracking-wider text-center ${
                  index <= currentStep ? 'text-white' : 'text-gray-500'
                }`}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
