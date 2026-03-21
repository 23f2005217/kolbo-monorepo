'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';

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
  category?: any;
}



function ChannelPill({ 
  channel, 
  color, 
  isSelected, 
  basePath 
}: { 
  channel: Channel; 
  color: string; 
  isSelected: boolean; 
  basePath: string;
}) {
  const { ref, focused } = useFocusable({
    onEnterPress: () => {
      window.location.href = isSelected ? basePath : `${basePath}?channel=${channel.slug}`;
    }
  });

  return (
    <Link
      ref={ref as any}
      href={isSelected ? basePath : `${basePath}?channel=${channel.slug}`}
      className={`shrink-0 rounded-xl px-8 py-5 text-sm font-semibold text-white ${color} transition-all hover:opacity-90 hover:scale-105 ${
        isSelected ? 'ring-2 ring-white/40 scale-105' : ''
      } ${focused ? 'scale-110 z-10 ring-4 ring-white' : ''}`}
    >
      {channel.name}
    </Link>
  );
}

export function BrowseChannels({ selectedSlug = null, basePath = '/', category }: BrowseChannelsProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChannels() {
      try {
        const res = await fetch('/api/subsites?all=true');
        if (res.ok) {
          const data = await res.json();
          let activeChannels = data.filter((c: any) => c.isActive);
          
          if (category?.config?.subsiteIds?.length > 0) {
            activeChannels = activeChannels.filter((c: any) => 
              category.config.subsiteIds.includes(c.id)
            );
          }
          
          setChannels(activeChannels);
        }
      } catch (error) {
        console.error('Failed to fetch channels:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchChannels();
  }, [category]);

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
    <section className="w-full overflow-hidden bg-[#0a0b14] py-4 px-4 md:px-8" aria-label={category?.name || "Channels"}>
      {category?.name && (
        <h2 className="mb-4 text-xl font-bold text-white md:text-2xl">
          {category.name}
        </h2>
      )}
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {channels.map((channel, index) => {
          const isSelected = selectedSlug === channel.slug;
          const color = CHANNEL_COLORS[index % CHANNEL_COLORS.length];
          
          return (
            <ChannelPill 
              key={channel.slug} 
              channel={channel} 
              color={color} 
              isSelected={isSelected} 
              basePath={basePath} 
            />
          );
        })}
      </div>
    </section>
  );
}
