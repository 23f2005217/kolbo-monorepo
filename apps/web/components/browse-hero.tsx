'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useChannelAccent } from '@/contexts/channel-accent-context';
import Link from 'next/link';

const SLIDE_COUNT = 3;
const AUTO_PLAY_INTERVAL = 5000;

const slides = [
  {
    id: 1,
    title: 'RAMASHAN',
    badge: 'A HOLYFIV MUSIC ORIGINAL',
    background: 'https://images.unsplash.com/photo-1574267432644-f4d6ca1b1e5c?w=1920&h=1080&fit=crop',
  },
  {
    id: 2,
    title: 'NEW SERIES',
    badge: 'EXCLUSIVE PREMIERE',
    background: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&h=1080&fit=crop',
  },
  {
    id: 3,
    title: 'FEATURED',
    badge: 'WATCH NOW',
    background: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=1920&h=1080&fit=crop',
  },
];

interface BrowseHeroProps {
  selectedChannelSlug?: string | null;
}

export function BrowseHero({ selectedChannelSlug = null }: BrowseHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (selectedChannelSlug) {
      fetch(`/api/subsites?slug=${selectedChannelSlug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) setChannel(data);
        })
        .catch((err) => console.error('Failed to fetch channel:', err));
    } else {
      setChannel(null);
    }
  }, [selectedChannelSlug]);

  useEffect(() => {
    if (selectedChannelSlug) return; // Don't auto-scroll if showing channel
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % SLIDE_COUNT);
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [selectedChannelSlug]);

  const goToPrevious = () => {
    setActiveIndex((i) => (i === 0 ? SLIDE_COUNT - 1 : i - 1));
  };

  const goToNext = () => {
    setActiveIndex((i) => (i === SLIDE_COUNT - 1 ? 0 : i + 1));
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  const currentSlide = slides[activeIndex];
  const { accentColor } = useChannelAccent();

  if (selectedChannelSlug && channel) {
    const thumbnailUrl = channel.thumbnailUrl;
    const priceText = channel.monthlyPrice ? `$${(channel.monthlyPrice / 100).toFixed(2)}/per month` : '$7.99/per month';

    return (
      <section className="relative w-full overflow-hidden bg-[#0a0b14]" aria-label="Channel Hero">
        {/* Background Layer with Waves and Blur */}
        <div className="absolute inset-0 z-0">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt=""
              className="size-full object-cover blur-3xl opacity-30 scale-125"
            />
          ) : (
            <div className="size-full bg-gradient-to-r from-blue-900/20 to-purple-900/20" />
          )}
          {/* Animated Wave Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0a0b14]" />
          <div 
            className="absolute inset-0 opacity-40 mix-blend-overlay"
            style={{ 
              background: `radial-gradient(circle at 20% 50%, ${accentColor}44 0%, transparent 70%)` 
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-12 md:px-12 md:py-20">
          {/* Back Button */}
          <Link 
            href="/browse"
            className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/40 transition-colors hover:text-white"
          >
            <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            <span>Back</span>
          </Link>

          <div className="flex flex-col items-start gap-10 md:flex-row md:items-end">
            {/* Channel Logo & Badge */}
            <div className="flex flex-col items-center gap-4">
              <div className="size-32 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1 shadow-2xl md:size-48">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={channel.name}
                    className="size-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center rounded-xl bg-white/10 text-4xl font-bold text-white/20">
                    {channel.name?.[0]}
                  </div>
                )}
              </div>
              <span className="rounded-md bg-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                ENTERTAINMENT
              </span>
            </div>

            {/* Content Area */}
            <div className="flex flex-col items-start gap-6 pb-2">
              <div className="space-y-2">
                <h1 className="text-5xl font-black tracking-tight text-white md:text-7xl">
                  {channel.name}
                </h1>
                {channel.description && (
                  <p className="max-w-xl text-lg font-medium text-white/60">
                    {channel.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-8">
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-blue-400">
                    {priceText}
                  </span>
                  <span className="text-sm font-medium text-white/30">
                    (7 day free trial)
                  </span>
                </div>

                <Link
                  href={`/subscribe?modify=${channel.id}`}
                  className="flex h-12 items-center gap-2 rounded-xl bg-white px-8 text-sm font-bold text-[#0a0b14] transition-all hover:scale-105 hover:bg-white/90 active:scale-95"
                >
                  <Plus className="size-4 stroke-[3]" />
                  Add to Subscription
                </Link>
              </div>
            </div>

            {/* Floating Characters Decor (If we had specific assets) */}
            <div className="absolute bottom-0 right-0 hidden h-full w-1/3 overflow-hidden pointer-events-none lg:block">
               {/* We could place character images here */}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full bg-[#0a0b14]" aria-label="Featured">
      <div className="relative flex aspect-[21/7] min-h-[220px] w-full items-center justify-center overflow-hidden md:aspect-[21/6] lg:min-h-[320px]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={currentSlide.background}
            alt=""
            className="size-full object-cover blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0b14]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex size-full flex-col items-center justify-center px-4 text-center">
          {/* Badge */}
          <div
            className="mb-4 inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm"
            style={{ backgroundColor: `${accentColor}cc` }}
          >
            {currentSlide.badge}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-black tracking-wider text-white drop-shadow-2xl sm:text-4xl md:text-5xl lg:text-6xl">
            {currentSlide.title}
          </h1>
        </div>

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={goToPrevious}
          className="absolute left-4 z-20 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 md:size-12"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-6 md:size-7" />
        </button>
        <button
          type="button"
          onClick={goToNext}
          className="absolute right-4 z-20 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 md:size-12"
          aria-label="Next slide"
        >
          <ChevronRight className="size-6 md:size-7" />
        </button>
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2 py-4">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goToSlide(i)}
            className={`size-2 rounded-full transition-all ${
              i === activeIndex ? 'w-6 bg-white' : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === activeIndex ? 'true' : undefined}
          />
        ))}
      </div>
    </section>
  );
}
