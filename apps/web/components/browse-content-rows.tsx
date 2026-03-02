'use client';

import Link from 'next/link';
import { Play, Plus } from 'lucide-react';
import { useChannelAccent } from '@/contexts/channel-accent-context';
import { useBrowseVideos } from '@/hooks/use-browse-videos';
import { TORAH_LIVE_SLUG } from './browse-channels';

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

const FALLBACK_ROWS: BrowseRow[] = [
  {
    title: 'Toveedo',
    slug: 'toveedo',
    cards: [
      {
        id: '1',
        title: 'The Treasure of Lightning Bay',
        year: '2024',
        duration: '25min',
        rating: 'G',
        channelSlug: 'toveedo',
        thumbnail: 'https://picsum.photos/seed/toveedo1/400/225',
      },
      {
        id: '2',
        title: 'Robot Adventures',
        year: '2024',
        duration: '12min',
        rating: 'G',
        channelSlug: 'toveedo',
        thumbnail: 'https://picsum.photos/seed/toveedo2/400/225',
      },
      {
        id: '3',
        title: 'THE ATTIC',
        year: '2023',
        duration: '18min',
        rating: 'G',
        channelSlug: 'toveedo',
        thumbnail: 'https://picsum.photos/seed/toveedo3/400/225',
      },
      {
        id: '4',
        title: 'Family Stories',
        year: '2023',
        duration: '22min',
        rating: 'G',
        channelSlug: 'toveedo',
        thumbnail: 'https://picsum.photos/seed/toveedo4/400/225',
      },
      {
        id: '5',
        title: 'Word Power',
        year: '2023',
        duration: '20min',
        rating: 'G',
        channelSlug: 'toveedo',
        thumbnail: 'https://picsum.photos/seed/toveedo5/400/225',
      },
      {
        id: '6',
        title: 'Patience Chronicles',
        year: '2023',
        duration: '15min',
        rating: 'G',
        channelSlug: 'toveedo',
        thumbnail: 'https://picsum.photos/seed/toveedo6/400/225',
      },
    ],
  },
  {
    title: 'Chofetz Chaim',
    slug: 'chofetz-chaim',
    cards: [
      {
        id: 'cc-1',
        title: 'Chofetz Chaim Heritage Foundation',
        year: '2024',
        duration: '15min',
        rating: 'G',
        channelSlug: 'chofetz-chaim',
        thumbnail: 'https://picsum.photos/seed/chofetz1/400/225',
      },
      {
        id: 'cc-2',
        title: 'The Great Divide',
        year: '2024',
        duration: '18min',
        rating: 'G',
        channelSlug: 'chofetz-chaim',
        thumbnail: 'https://picsum.photos/seed/chofetz2/400/225',
      },
      {
        id: 'cc-3',
        title: 'Prolidy Teshuva',
        year: '2023',
        duration: '20min',
        rating: 'G',
        channelSlug: 'chofetz-chaim',
        thumbnail: 'https://picsum.photos/seed/chofetz3/400/225',
      },
      {
        id: 'cc-4',
        title: 'Heritage Series',
        year: '2023',
        duration: '25min',
        rating: 'G',
        channelSlug: 'chofetz-chaim',
        thumbnail: 'https://picsum.photos/seed/chofetz4/400/225',
      },
    ],
  },
  {
    title: 'Torah Live',
    slug: TORAH_LIVE_SLUG,
    cards: [
      {
        id: 'tl-1',
        title: 'Featured Content',
        year: '2024',
        duration: '25min',
        rating: 'G',
        channelSlug: TORAH_LIVE_SLUG,
        thumbnail: 'https://picsum.photos/seed/torah1/400/225',
      },
      {
        id: 'tl-2',
        title: 'Parsha Series',
        year: '2024',
        duration: '30min',
        rating: 'G',
        channelSlug: TORAH_LIVE_SLUG,
        thumbnail: 'https://picsum.photos/seed/torah2/400/225',
      },
      {
        id: 'tl-3',
        title: 'Hashkafa Lessons',
        year: '2023',
        duration: '45min',
        rating: 'G',
        channelSlug: TORAH_LIVE_SLUG,
        thumbnail: 'https://picsum.photos/seed/torah3/400/225',
      },
    ],
  },
];

interface ContentCardProps {
  card: BrowseCard;
}

function ContentCard({ card }: ContentCardProps) {
  const { playButtonClass } = useChannelAccent();
  const thumbnail = card.thumbnail || 'https://picsum.photos/seed/placeholder/400/225';
  return (
    <Link
      href={`/watch/${card.id}`}
      className="group relative flex aspect-video min-w-[min(200px,48vw)] shrink-0 overflow-visible rounded-lg transition-transform duration-200 hover:z-10 hover:scale-110 sm:min-w-[240px] md:min-w-[280px] lg:min-w-[300px]"
    >
      <div className="relative size-full overflow-hidden rounded-lg bg-gray-800">
        {/* Thumbnail */}
        <img
          src={thumbnail}
          alt={card.title}
          className="size-full object-cover transition-opacity duration-200 group-hover:opacity-50"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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

        {/* Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 pt-10">
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
}

function videoToCard(v: { id: string; title: string; shortDescription?: string | null; subsite?: { slug: string } | null; assets?: Array<{ durationSeconds: number | null }>; customThumbnailUrl?: string }): BrowseCard {
  const durationSec = v.assets?.[0]?.durationSeconds;
  const duration = durationSec != null ? `${Math.floor(durationSec / 60)}min` : undefined;
  return {
    id: v.id,
    title: v.title,
    duration,
    channelSlug: v.subsite?.slug ?? '',
    thumbnail: v.customThumbnailUrl,
  };
}

export function BrowseContentRows({ selectedChannelSlug = null }: BrowseContentRowsProps) {
  const { videos, loading } = useBrowseVideos({
    subsiteSlug: selectedChannelSlug,
    limit: selectedChannelSlug ? 50 : undefined,
  });

  // When a channel is selected, show real API data (filtered by subsite)
  if (selectedChannelSlug) {
    const cards = videos.map(videoToCard);
    
    if (loading) {
      return (
        <section className="w-full space-y-8 bg-[#0a0b14] px-4 pb-16 pt-8 md:px-8">
          <div>
            <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-white/5" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-video w-full animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (cards.length === 0) {
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

    return (
      <section className="w-full space-y-8 bg-[#0a0b14] px-4 pb-16 pt-8 md:px-8">
        <div>
          <h2 className="mb-4 text-xl font-bold text-white md:text-2xl">Latest Videos</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cards.map((card) => (
              <ContentCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Default view: fallback rows (no API filter)
  return (
    <section className="w-full space-y-8 bg-[#0a0b14] px-4 pb-16 pt-4 md:px-8">
      {FALLBACK_ROWS.map((row) => (
        <div key={row.slug}>
          <h2 className="mb-4 text-xl font-semibold text-white md:text-2xl">{row.title}</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {row.cards.map((card) => (
              <ContentCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
