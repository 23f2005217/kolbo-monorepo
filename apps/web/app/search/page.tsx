'use client';

import { Suspense, useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { BrowseHeader } from '@/components/browse-header';
import { SearchFilters } from '@/components/search-filters';
import { SearchResultCard, type SearchResult } from '@/components/search-result-card';
import { useBrowseVideos } from '@/hooks/use-browse-videos';
import { ChannelAccentProvider } from '@/contexts/channel-accent-context';

// Fallback mock data when API returns empty
const ALL_RESULTS: SearchResult[] = [
  {
    id: '1',
    title: 'The Wedding Day',
    channel: 'Toveedo',
    channelSlug: 'toveedo',
    type: 'Movie',
    year: '2023',
    duration: '1 hr',
    category: 'Entertainment',
    rating: 'Family',
    thumbnail: 'https://picsum.photos/seed/wedding/400/225',
  },
  // ... (keep ALL_RESULTS as is, it's just mock data)
];

interface Channel {
  id: string;
  name: string;
  slug: string;
}

function videoToSearchResult(v: {
  id: string;
  title: string;
  subsite?: { name: string; slug: string } | null;
  category?: { name: string } | null;
  assets?: Array<{ durationSeconds: number | null }>;
  customThumbnailUrl?: string;
  muxThumbnailUrl?: string;
  publishedAt?: string | null;
}): SearchResult {
  const durationSec = v.assets?.[0]?.durationSeconds;
  const duration = durationSec != null ? `${Math.floor(durationSec / 60)} min` : '—';
  const year = v.publishedAt ? new Date(v.publishedAt).getFullYear().toString() : '—';
  return {
    id: v.id,
    title: v.title,
    channel: v.subsite?.name ?? 'Kolbo',
    channelSlug: v.subsite?.slug ?? '',
    type: 'Movie',
    year,
    duration,
    category: v.category?.name ?? 'Entertainment',
    thumbnail: v.customThumbnailUrl || v.muxThumbnailUrl || 'https://picsum.photos/seed/placeholder/400/225',
  };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const channelFromUrl = searchParams.get('channel');
  const [searchQuery, setSearchQuery] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(true);

  // Fetch channels
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
        setChannelsLoading(false);
      }
    }
    fetchChannels();
  }, []);

  const [selectedChannel, setSelectedChannel] = useState('All Channels');

  // Update selected channel when URL changes or channels load
  useEffect(() => {
    if (channelFromUrl && channels.length > 0) {
      const ch = channels.find((c) => c.slug === channelFromUrl);
      if (ch) {
        setSelectedChannel(ch.name);
      } else {
        setSelectedChannel('All Channels');
      }
    } else if (!channelFromUrl) {
      setSelectedChannel('All Channels');
    }
  }, [channelFromUrl, channels]);

  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedSort, setSelectedSort] = useState('Relevance');

  const channelSlug = selectedChannel !== 'All Channels'
    ? channels.find((c) => c.name === selectedChannel)?.slug
    : null;

  const { videos, loading } = useBrowseVideos({
    subsiteSlug: channelSlug ?? undefined,
    search: searchQuery || undefined,
    limit: 100,
  });

  const handleClearAll = () => {
    setSelectedChannel('All Channels');
    setSelectedCategory('All Categories');
    setSelectedType('All Types');
    setSelectedYear('All Years');
    setSelectedSort('Relevance');
  };

  const handleRemoveChannelFilter = () => {
    setSelectedChannel('All Channels');
  };

  const apiResults = useMemo(() => videos.map(videoToSearchResult), [videos]);

  const filteredResults = useMemo(() => {
    let results = apiResults.length > 0 ? apiResults : ALL_RESULTS;

    // Filter by search query (client-side when using mock data)
    if (searchQuery && apiResults.length === 0) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.channel.toLowerCase().includes(query) ||
          r.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'All Categories') {
      results = results.filter((r) => r.category === selectedCategory);
    }

    // Filter by type
    if (selectedType !== 'All Types') {
      results = results.filter((r) => r.type === selectedType);
    }

    // Filter by year
    if (selectedYear !== 'All Years') {
      results = results.filter((r) => r.year === selectedYear);
    }

    // Sort results
    if (selectedSort === 'Newest First') {
      results = [...results].sort((a, b) => parseInt(b.year) - parseInt(a.year));
    } else if (selectedSort === 'Oldest First') {
      results = [...results].sort((a, b) => parseInt(a.year) - parseInt(b.year));
    } else if (selectedSort === 'A-Z') {
      results = [...results].sort((a, b) => a.title.localeCompare(b.title));
    } else if (selectedSort === 'Z-A') {
      results = [...results].sort((a, b) => b.title.localeCompare(a.title));
    }

    return results;
  }, [
    apiResults,
    searchQuery,
    selectedCategory,
    selectedType,
    selectedYear,
    selectedSort,
  ]);

  const activeFilters = [
    selectedChannel !== 'All Channels' && {
      label: selectedChannel,
      onRemove: handleRemoveChannelFilter,
    },
  ].filter(Boolean);

  const channelSlugForAccent = channels.find((c) => c.name === selectedChannel)?.slug ?? null;

  return (
    <ChannelAccentProvider channelSlug={channelSlugForAccent}>
      <div className="min-h-screen bg-[#0a0b14] text-white">
        <BrowseHeader />

        <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold text-white">Search</h1>
            <p className="text-sm text-white/60">
              Find content across all 35 channels on the platform
            </p>
          </div>

          {/* Search Input */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="Search for movies, shows, channels, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-[#1a1b24] py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:border-[#4A90FF] focus:outline-none focus:ring-2 focus:ring-[#4A90FF]/20"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <SearchFilters
              selectedChannel={selectedChannel}
              selectedCategory={selectedCategory}
              selectedType={selectedType}
              selectedYear={selectedYear}
              selectedSort={selectedSort}
              onChannelChange={setSelectedChannel}
              onCategoryChange={setSelectedCategory}
              onTypeChange={setSelectedType}
              onYearChange={setSelectedYear}
              onSortChange={setSelectedSort}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Results Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-white/70">
              <span className="font-semibold text-white">
                {filteredResults.length}
              </span>{' '}
              results found
            </p>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter: any) => (
                  <button
                    key={filter.label}
                    onClick={filter.onRemove}
                    className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white transition-colors hover:bg-white/20"
                  >
                    {filter.label}
                    <X className="size-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results Grid */}
          {filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredResults.map((result) => (
                <SearchResultCard key={result.id} result={result} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-white/10 bg-[#1a1b24] p-8 text-center">
              <Search className="mb-4 size-12 text-white/30" />
              <h3 className="mb-2 text-xl font-semibold text-white">
                No results found
              </h3>
              <p className="text-sm text-white/60">
                Try adjusting your search or filters to find what you're looking for
              </p>
            </div>
          )}
        </main>
      </div>
    </ChannelAccentProvider>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
