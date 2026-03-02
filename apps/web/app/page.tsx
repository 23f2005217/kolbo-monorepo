'use client';

import { Suspense, useEffect, useCallback } from 'react';
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

  // Removed redirect to HQ - Users stay on public site
  useEffect(() => {
    // If we wanted to redirect logged-in users to a dashboard, we'd do it here.
    // For now, they stay on the home page but with auth state.
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0b14]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  // if (isAuthenticated) {
  //   return null; 
  // }


  return (
    <ChannelAccentProvider channelSlug={selectedChannelSlug}>
      <div className="min-h-screen bg-[#0a0b14] text-white">
        <BrowseHeader />
        <main>
          {/* Show hero slider only when no channel is selected */}
          {!selectedChannelSlug && <BrowseHero selectedChannelSlug={selectedChannelSlug} />}

          <BrowseChannels selectedSlug={selectedChannelSlug} />

          {/* Show featured banner when a channel is selected */}
          {selectedChannelSlug && (
            <ChannelFeaturedBanner
              title="Welcome"
              subtitle={selectedChannelSlug}
              description="Watch the newest adventures"
              backgroundImage="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&h=1080&fit=crop"
              channelSlug={selectedChannelSlug}
            />
          )}

          <BrowseContentRows selectedChannelSlug={selectedChannelSlug} />
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
