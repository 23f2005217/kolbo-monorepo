'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { TORAH_LIVE_SLUG } from '@/components/browse-channels';

export const TORAH_LIVE_ORANGE = '#C94A2A';
export const DEFAULT_ACCENT = '#4A90FF';

interface ChannelAccentContextValue {
  accentColor: string;
  accentClass: string;
  playButtonClass: string;
  isTorahLive: boolean;
}

const ChannelAccentContext = createContext<ChannelAccentContextValue>({
  accentColor: DEFAULT_ACCENT,
  accentClass: 'bg-[#4A90FF]',
  playButtonClass: 'bg-[#4A90FF] hover:bg-[#3b7fe6]',
  isTorahLive: false,
});

export function ChannelAccentProvider({
  channelSlug,
  children,
}: {
  channelSlug?: string | null;
  children: React.ReactNode;
}) {
  const value = useMemo(() => {
    const isTorahLive = channelSlug === TORAH_LIVE_SLUG;
    return {
      accentColor: isTorahLive ? TORAH_LIVE_ORANGE : DEFAULT_ACCENT,
      accentClass: isTorahLive ? 'bg-[#C94A2A]' : 'bg-[#4A90FF]',
      playButtonClass: isTorahLive
        ? 'bg-[#C94A2A] hover:bg-[#b84328]'
        : 'bg-[#4A90FF] hover:bg-[#3b7fe6]',
      isTorahLive,
    };
  }, [channelSlug]);

  return (
    <ChannelAccentContext.Provider value={value}>
      {children}
    </ChannelAccentContext.Provider>
  );
}

export function useChannelAccent() {
  return useContext(ChannelAccentContext);
}
