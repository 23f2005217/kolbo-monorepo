'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserAuthContext } from '@/components/user-auth-provider';
import { BrowseHeader } from '@/components/browse-header';
import { BrowseHero } from '@/components/browse-hero';
import { BrowseChannels } from '@/components/browse-channels';
import { BrowseContentRows } from '@/components/browse-content-rows';
import { ChannelFeaturedBanner } from '@/components/channel-featured-banner';
import { ChannelAccentProvider } from '@/contexts/channel-accent-context';

function HomeContent() {
  const { isAuthenticated, loading } = useUserAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedChannelSlug = searchParams.get('channel');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    // If we wanted to redirect logged-in users to a dashboard, we'd do it here.
    // For now, they stay on the home page but with auth state.
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (!selectedChannelSlug) {
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setCategories(data.filter(c => c.isActive).sort((a, b) => (a.position || 0) - (b.position || 0)));
          }
        })
        .catch(console.error);
    }
  }, [selectedChannelSlug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0b14]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  return (
    <ChannelAccentProvider channelSlug={selectedChannelSlug}>
      <div className="min-h-screen bg-[#0a0b14] text-white">
        <BrowseHeader />
        <main>
          {selectedChannelSlug ? (
            <>
              <BrowseChannels selectedSlug={selectedChannelSlug} />
              <ChannelFeaturedBanner
                title="Welcome"
                subtitle={selectedChannelSlug}
                description="Watch the newest adventures"
                backgroundImage="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&h=1080&fit=crop"
                channelSlug={selectedChannelSlug}
              />
              <BrowseContentRows selectedChannelSlug={selectedChannelSlug} />
            </>
          ) : (
            <div className="flex flex-col">
              {categories.map((c) => {
                if (c.type === 'hero_banner') {
                  return <BrowseHero key={c.id} category={c} />;
                }
                if (c.type === 'category_card_row') {
                  return <BrowseChannels key={c.id} category={c} />;
                }
                if (c.type === 'video_row') {
                  return <BrowseContentRows key={c.id} category={c} />;
                }
                if (c.type === 'large_text_block') {
                  return (
                    <div key={c.id} className="py-12 px-4 md:px-8 text-center max-w-4xl mx-auto">
                      <h2 className="text-3xl md:text-5xl font-black mb-4">{c.name}</h2>
                      {c.description && <p className="text-lg text-white/60">{c.description}</p>}
                    </div>
                  );
                }
                if (c.type === 'divider') {
                  return <div key={c.id} className="w-full h-px bg-white/10 my-8 max-w-[1400px] mx-auto" />;
                }
                return null;
              })}
              {categories.length === 0 && (
                <div className="py-20 text-center text-white/50">Loading homepage...</div>
              )}
            </div>
          )}
        </main>
      </div>
    </ChannelAccentProvider>
  );
}

export default function PublicHome() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0a0b14]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
