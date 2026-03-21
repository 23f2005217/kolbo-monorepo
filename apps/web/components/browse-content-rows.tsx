"use client";

import Link from "next/link";
import { Play, Plus } from "lucide-react";
import { useChannelAccent } from "@/contexts/channel-accent-context";
import { useBrowseVideos } from "@/hooks/use-browse-videos";
import { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';

export interface BrowseCard {
  id: string;
  title: string;
  year?: string;
  duration?: string;
  rating?: string;
  channelSlug: string;
  thumbnail?: string;
}

export interface BrowseRow {
  title: string;
  slug: string;
  cards: BrowseCard[];
}

interface ContentCardProps {
  card: BrowseCard;
}

function ContentCard({ card }: ContentCardProps) {
  const { playButtonClass } = useChannelAccent();
  const { ref, focused } = useFocusable({
    onEnterPress: () => {
      window.location.href = `/watch/${card.id}`;
    }
  });
  
  const thumbnail =
    card.thumbnail || "https://picsum.photos/seed/placeholder/400/225";
  return (
    <Link
      ref={ref as any}
      href={`/watch/${card.id}`}
      className={`group relative flex aspect-video min-w-[min(200px,48vw)] shrink-0 overflow-visible rounded-lg transition-all duration-200 hover:z-10 hover:scale-110 sm:min-w-60 md:min-w-80 lg:min-w-100 ${focused ? 'scale-110 z-10 ring-4 ring-white' : ''}`}
    >
      <div className="relative size-full overflow-hidden rounded-lg bg-gray-800">
        {/* Thumbnail */}
        <img
          src={thumbnail}
          alt={card.title}
          className="size-full object-cover transition-opacity duration-200 group-hover:opacity-50"
        />

        {/* Hover / Focus Overlay */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-4 transition-opacity duration-200 ${focused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button
            type="button"
            className={`flex size-12 items-center justify-center rounded-full text-white shadow-lg transition md:size-14 ${playButtonClass}`}
            aria-label="Play"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/watch/${card.id}`;
            }}
          >
            <Play className="ml-0.5 size-6 md:size-7" fill="currentColor" />
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full border-2 border-white/80 bg-black/40 text-white transition hover:bg-white/20"
            aria-label="Add to list"
            onClick={(e) => e.preventDefault()}
          >
            <Plus className="size-4" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/95 via-black/70 to-transparent p-3 pt-10">
          <p className="line-clamp-1 text-sm font-semibold text-white md:text-base">
            {card.title}
          </p>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-white/80">
            {card.rating && <span>{card.rating}</span>}
            {card.year && <span>{card.year}</span>}
            {card.duration && <span>{card.duration}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

interface BrowseContentRowsProps {
  selectedChannelSlug?: string | null;
  category?: any;
}

function videoToCard(v: {
  id: string;
  title: string;
  shortDescription?: string | null;
  subsite?: { slug: string } | null;
  assets?: Array<{ durationSeconds: number | null }>;
  customThumbnailUrl?: string;
  muxThumbnailUrl?: string;
}): BrowseCard {
  const durationSec = v.assets?.[0]?.durationSeconds;
  const duration =
    durationSec != null ? `${Math.floor(durationSec / 60)}min` : undefined;
  return {
    id: v.id,
    title: v.title,
    duration,
    channelSlug: v.subsite?.slug ?? "",
    thumbnail: v.customThumbnailUrl || v.muxThumbnailUrl,
  };
}

export function BrowseContentRows({
  selectedChannelSlug = null,
  category,
}: BrowseContentRowsProps) {
  const { videos, loading, initialLoading, loadMore } = useBrowseVideos({
    subsiteSlug: selectedChannelSlug || undefined,
    categoryId: category?.id,
    limit: selectedChannelSlug ? 50 : 20,
  });
  const loaderRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]

        if (entry.isIntersecting && !loading) {
          loadMore()
        }
      },
      {
        threshold: 1
      }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [loadMore, loading])

  // If a channel is selected OR a home category is passed
  if (selectedChannelSlug || category) {
    const cards = videos.map(videoToCard);

    if (initialLoading) {
      return (
        <section className="w-full space-y-8 bg-[#0a0b14] px-4 pb-16 pt-8 md:px-8">
          <div>
            <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-white/5" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton className="h-40 w-full" key={i} />
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (cards.length === 0 && selectedChannelSlug) {
      return (
        <section className="w-full space-y-8 bg-[#0a0b14] px-4 pb-16 pt-8 md:px-8">
          <div className="flex h-48 flex-col items-center justify-center gap-4 text-white/60">
            <p className="text-lg">No content found for this channel yet.</p>
            <Link
              href="/"
              className="rounded-full bg-white/10 px-6 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Browse all channels
            </Link>
          </div>
        </section>
      );
    }

    if (cards.length === 0 && category) {
      return null;
    }

    return (
      <section className="w-full space-y-6 bg-[#0a0b14] px-4 pb-10 pt-4 md:px-8">
        <div>
          <h2 className="mb-4 text-xl font-bold text-white md:text-2xl">
            {category?.name || "Latest Videos"}
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] shrink-0 xl:grid xl:grid-cols-4 lg:grid lg:grid-cols-3 md:grid md:grid-cols-2 sm:grid sm:grid-cols-1">
            {cards.map((card) => (
              <ContentCard key={card.id} card={card} />
            ))}
          </div>
        </div>
        <div ref={loaderRef}>
          {loading && (
            <div className="flex justify-center py-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
          )}
        </div>
      </section>
    );
  }

  return null;
}
