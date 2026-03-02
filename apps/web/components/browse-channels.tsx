'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Channel {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export const TORAH_LIVE_SLUG = 'torah-live';

const CHANNEL_COLORS = [
  'bg-[#4A6FEE]',
  'bg-[#D97E21]',
  'bg-[#C94A2A]',
  'bg-[#9D4AEE]',
  'bg-[#4A9FEE]',
  'bg-[#2D9F5A]',
  'bg-[#E8A922]',
  'bg-[#E84A9F]',
  'bg-[#E84A6F]',
];

interface BrowseChannelsProps {
  selectedSlug?: string | null;
  basePath?: string;
}

export function BrowseChannels({ selectedSlug = null, basePath = '/' }: BrowseChannelsProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChannels() {
      try {
        const res = await fetch('/api/subsites?all=true');
        if (res.ok) {
          const data = await res.json();
          setChannels(data.filter((c: any) => c.isActive));
        }
      } catch (error) {
        console.error('Failed to fetch channels:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchChannels();
  }, []);

  if (loading) {
    return (
      <section className="w-full overflow-hidden bg-[#0a0b14] py-4">
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 md:px-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 w-32 shrink-0 animate-pulse rounded-xl bg-white/10" />
          ))}
        </div>
      </section>
    );
  }

  if (channels.length === 0) return null;

  return (
    <section className="w-full overflow-hidden bg-[#0a0b14] py-4" aria-label="Channels">
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {channels.map(({ name, slug }, index) => {
          const isSelected = selectedSlug === slug;
          const color = CHANNEL_COLORS[index % CHANNEL_COLORS.length];
          
          return (
            <Link
              key={slug}
              href={isSelected ? basePath : `${basePath}?channel=${slug}`}
              className={`shrink-0 rounded-xl px-8 py-5 text-sm font-semibold text-white ${color} transition-all hover:opacity-90 hover:scale-105 ${
                isSelected ? 'ring-2 ring-white/40 scale-105' : ''
              }`}
            >
              {name}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
