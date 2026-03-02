'use client';

import { Play } from 'lucide-react';
import { useChannelAccent } from '@/contexts/channel-accent-context';

interface ChannelFeaturedBannerProps {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
  logoImage?: string;
  channelSlug: string;
}

export function ChannelFeaturedBanner({
  title,
  subtitle,
  description,
  backgroundImage,
  logoImage,
  channelSlug,
}: ChannelFeaturedBannerProps) {
  const { playButtonClass } = useChannelAccent();
  return (
    <section className="relative w-full bg-[#0a0b14]" aria-label="Featured Content">
      <div className="relative flex min-h-[220px] w-full items-center overflow-hidden md:min-h-[320px] lg:min-h-[420px]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt=""
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0b14]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex size-full items-center">
          <div className="w-full max-w-7xl px-4 md:px-8">
            <div className="max-w-2xl space-y-6">
              {/* Logo/Title Image */}
              {logoImage ? (
                <img
                  src={logoImage}
                  alt={title}
                  className="h-24 w-auto object-contain md:h-32 lg:h-40"
                />
              ) : (
                <h1 className="text-4xl font-black text-white drop-shadow-2xl sm:text-5xl md:text-6xl lg:text-7xl">
                  {title}
                </h1>
              )}

              {/* Subtitle */}
              <h2 className="text-xl font-bold text-white md:text-2xl lg:text-3xl">
                {subtitle}
              </h2>

              {/* Description */}
              <p className="text-base text-white/90 md:text-lg">
                {description}
              </p>

              {/* Watch Now Button */}
              <button
                type="button"
                className={`flex items-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition md:px-8 md:py-4 md:text-lg ${playButtonClass}`}
              >
                <Play className="size-5 md:size-6" fill="currentColor" />
                Watch Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
