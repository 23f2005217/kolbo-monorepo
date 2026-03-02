'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useChannelAccent } from '@/contexts/channel-accent-context';

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

    return (
      <section className="relative w-full bg-[#0a0b14]" aria-label="Channel Hero">
        <div className="relative flex aspect-[21/7] min-h-[220px] w-full items-center justify-center overflow-hidden md:aspect-[21/6] lg:min-h-[320px]">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt=""
                className="size-full object-cover blur-md scale-105"
              />
            ) : (
              <div className="size-full bg-gradient-to-r from-gray-900 to-slate-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0a0b14]" />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex size-full flex-col items-center justify-center px-4 text-center">
            {thumbnailUrl && (
              <div className="mb-6 overflow-hidden rounded-full border-4 border-white/20 shadow-2xl">
                <img
                  src={thumbnailUrl}
                  alt={channel.name}
                  className="size-24 object-cover md:size-32"
                />
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl font-black tracking-wider text-white drop-shadow-2xl sm:text-4xl md:text-5xl lg:text-6xl">
              {channel.name}
            </h1>
            {channel.description && (
              <p className="mt-4 max-w-2xl text-lg text-white/80 drop-shadow-md">
                {channel.description}
              </p>
            )}
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
