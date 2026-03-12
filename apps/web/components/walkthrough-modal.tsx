'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@kolbo/ui';

interface Props {
  isOpen: boolean;
  onComplete: () => void;
}

export function WalkthroughModal({ isOpen, onComplete }: Props) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [canClose, setCanClose] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0b14]/95 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl bg-[#121421] rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
        {canClose && (
          <button 
            onClick={onComplete}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="aspect-video bg-black relative group">
          {/* Placeholder for actual walkthrough video */}
          <video 
            ref={videoRef}
            src="https://framerusercontent.com/modules/assets/1Iu4YqU7fN5lY9lE0U0N9uA3s.mp4" 
            autoPlay 
            muted 
            className="w-full h-full object-cover"
            onEnded={() => canClose && onComplete()}
          />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000 ease-linear" 
              style={{ width: `${((60 - timeLeft) / 60) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-8 flex items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Site Walkthrough</h2>
            <p className="text-sm text-white/40">Learn how to get the most out of your KolBo experience</p>
          </div>

          <div className="flex items-center justify-center size-14 rounded-full border-2 border-white/10 relative">
            <svg className="absolute inset-0 size-full -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-blue-500 transition-all duration-1000 ease-linear"
                style={{
                  strokeDasharray: 151,
                  strokeDashoffset: 151 - (151 * (60 - timeLeft)) / 60
                }}
              />
            </svg>
            <span className="text-sm font-bold font-mono">{timeLeft}</span>
          </div>
        </div>

        {!canClose && (
          <div className="px-8 pb-8">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
              <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-xs font-semibold text-blue-400">Please watch the full video to continue</p>
            </div>
          </div>
        )}

        {canClose && (
          <div className="px-8 pb-8">
            <button 
              onClick={onComplete}
              className="w-full h-12 rounded-xl bg-white text-[#0a0b14] font-bold hover:bg-white/90 transition-all"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
