'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BrowseHeader } from '@/components/browse-header';
import { BrowseHero } from '@/components/browse-hero';
import { BrowseChannels } from '@/components/browse-channels';
import { BrowseContentRows } from '@/components/browse-content-rows';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { ChannelAccentProvider } from '@/contexts/channel-accent-context';

function BrowseContent() {
  const searchParams = useSearchParams();
  const selectedChannelSlug = searchParams.get('channel');

  return (
    <ChannelAccentProvider channelSlug={selectedChannelSlug}>
      <div className="min-h-screen bg-[#0a0b14] text-white">
        <BrowseHeader transparent={!!selectedChannelSlug} />
        <main className={selectedChannelSlug ? "-mt-14" : ""}>
          <BrowseHero selectedChannelSlug={selectedChannelSlug} />
          
          {selectedChannelSlug ? null : (
            <BrowseChannels
              selectedSlug={selectedChannelSlug}
              basePath="/browse"
            />
          )}

          <BrowseContentRows 
            key={selectedChannelSlug || 'all'} 
            selectedChannelSlug={selectedChannelSlug} 
          />
        </main>
      </div>
    </ChannelAccentProvider>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
