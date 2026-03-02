'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Heart, Play, Volume2, Maximize, SkipBack, SkipForward, Settings, Loader2, Lock } from 'lucide-react';
import { BrowseHeader } from '@/components/browse-header';
import { useWatchVideo } from '@/hooks/use-watch-video';
import { ChannelAccentProvider } from '@/contexts/channel-accent-context';
import { useUserAuthContext } from '@/components/user-auth-provider';
import { GatedMuxPlayer } from '@/components/video/gated-mux-player';

function WatchPlayContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const channelSlug = searchParams.get('channel');
  const id = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  const { video, loading, gatingType } = useWatchVideo(id);
  const { isAuthenticated, loading: authLoading } = useUserAuthContext();
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // Protect the route - require login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/login?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, authLoading, router]);

  // GatedMuxPlayer handles access verification internally
  const title = video?.title ?? 'Video';

  // For free content, show player directly. For gated, GatedMuxPlayer will handle access check
  const showPlayer = !loading && !authLoading && (gatingType === 'free' || gatingType === 'free_with_ads');

  return (
    <ChannelAccentProvider channelSlug={channelSlug}>
      <div className="min-h-screen bg-[#0a0b14] text-white">
        <BrowseHeader />

        <div className="px-4 pt-2 md:px-8">
          <Link
            href={`/watch/${id}${channelSlug ? `?channel=${channelSlug}` : ''}`}
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white"
          >
            <ChevronLeft className="size-4" />
            Back
          </Link>
        </div>

        <div className="relative mt-4 w-full overflow-hidden rounded-lg bg-black px-4 md:px-6 lg:px-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
            {/* Loading state */}
            {(loading || authLoading) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <Loader2 className="size-10 animate-spin text-white" />
              </div>
            )}

            {/* GatedMuxPlayer - handles all access verification internally */}
            {!loading && !authLoading && !playbackError && (
              <div className="absolute inset-0">
                <GatedMuxPlayer
                  videoId={id}
                  onError={(error) => {
                    console.error('GatedMuxPlayer error:', error);
                    setPlaybackError(`Playback Error: ${error.message}`);
                  }}
                />
              </div>
            )}

            {/* Error State Overlay */}
            {playbackError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50">
                <div className="mb-4 rounded-full bg-red-500/20 p-4">
                  <Lock className="size-8 text-red-500" />
                </div>
                <p className="text-center text-xl font-bold text-white mb-2">Viadeo Playback Failed</p>
                <p className="text-sm text-red-400 max-w-md text-center px-4">{playbackError}</p>
                <button
                  onClick={() => setPlaybackError(null)}
                  className="mt-6 rounded-full bg-white/10 px-6 py-2 text-sm font-medium text-white hover:bg-white/20"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Access denied is handled by GatedMuxPlayer internally */}

            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/90 to-transparent px-4 py-3">
              <div className="flex items-center gap-2">
                <button type="button" className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Play">
                  <Play className="size-5" fill="currentColor" />
                </button>
                <button type="button" className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Skip back">
                  <SkipBack className="size-5" />
                </button>
                <button type="button" className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Skip forward">
                  <SkipForward className="size-5" />
                </button>
                <button type="button" className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Volume">
                  <Volume2 className="size-5" />
                </button>
                <span className="ml-2 text-xs text-white/80">00:00</span>
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-1">
                <div className="h-1 min-w-[5rem] flex-1 rounded-full bg-white/30" />
                <button type="button" className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Settings">
                  <Settings className="size-5" />
                </button>
                <button type="button" className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Picture in picture">
                  <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
                  </svg>
                </button>
                <button type="button" className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Fullscreen">
                  <Maximize className="size-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full px-4 py-6 md:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">{title}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                {['Featured', 'Family', "What's New?"].map((tag) => (
                  <span key={tag} className="rounded-full bg-white/15 px-3 py-1 text-xs text-white/90">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
              >
                <Heart className="size-4" />
                Add to Favorites
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-start gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={autoplayNext}
                onClick={() => setAutoplayNext(!autoplayNext)}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${autoplayNext ? 'bg-[#2563eb]' : 'bg-white/20'}`}
              >
                <span
                  className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${autoplayNext ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
              <span className="text-sm text-white/90">AutoPlay</span>
            </label>
          </div>
        </div>

        <a
          href="#"
          className="fixed bottom-6 right-6 flex size-12 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-lg"
          aria-label="Chat"
        >
          <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        </a>
      </div>
    </ChannelAccentProvider>
  );
}

export default function WatchPlayPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0a0b14]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    }>
      <WatchPlayContent />
    </Suspense>
  );
}
