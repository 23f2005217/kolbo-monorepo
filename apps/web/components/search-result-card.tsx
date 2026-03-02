'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useChannelAccent } from '@/contexts/channel-accent-context';

export interface SearchResult {
  id: string;
  title: string;
  channel: string;
  channelSlug: string;
  type: 'Movie' | 'Short' | 'Documentary' | 'Lecture' | 'Series';
  year: string;
  duration: string;
  category: string;
  rating?: string;
  thumbnail: string;
}

interface SearchResultCardProps {
  result: SearchResult;
}

const TYPE_COLORS = {
  Movie: 'bg-purple-600/90',
  Short: 'bg-blue-600/90',
  Documentary: 'bg-green-600/90',
  Lecture: 'bg-orange-600/90',
  Series: 'bg-pink-600/90',
};

export function SearchResultCard({ result }: SearchResultCardProps) {
  const router = useRouter();
  const { accentColor } = useChannelAccent();

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/watch/${result.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          router.push(`/watch/${result.id}`);
        }
      }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-lg bg-[#1a1b24] transition-transform duration-200 hover:scale-105 hover:shadow-xl"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-800">
        <img
          src={result.thumbnail}
          alt={result.title}
          className="size-full object-cover transition-opacity duration-200 group-hover:opacity-75"
        />

        {/* Type Badge */}
        <div className="absolute left-3 top-3">
          <Badge
            className={`${TYPE_COLORS[result.type]} border-0 text-xs font-semibold text-white`}
          >
            {result.type}
          </Badge>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black/80 px-2 py-1 text-xs text-white backdrop-blur-sm">
          <Clock className="size-3" />
          {result.duration}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div
            className="flex size-14 items-center justify-center rounded-full"
            style={{ backgroundColor: accentColor }}
          >
            <svg
              viewBox="0 0 24 24"
              className="ml-1 size-6"
              fill="white"
              aria-hidden
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 line-clamp-2 text-base font-semibold text-white">
          {result.title}
        </h3>

        <Link
          href={`/browse?channel=${result.channelSlug}`}
          className="mb-3 text-sm font-medium hover:underline"
          style={{ color: accentColor }}
          onClick={(e) => e.stopPropagation()}
        >
          {result.channel}
        </Link>

        <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-white/60">
          <span>{result.year}</span>
          <span>•</span>
          <span>{result.category}</span>
          {result.rating && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Star className="size-3 fill-current text-yellow-500" />
                <span>{result.rating}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
