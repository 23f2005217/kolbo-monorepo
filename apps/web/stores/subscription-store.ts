import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChannelConfig {
  subsiteId: string;
  devices: number; // 3 or 5
  hasAds: boolean;
  calculatedPriceCents: number;
}

interface SubscriptionState {
  selectedStreams: { id: string; devices: number } | null;
  selectedExperience: { id: string; hasAds: boolean } | null;
  selectedChannels: ChannelConfig[];
  selectedBundles: { id: string; devices: number }[];
  discountCode: string;

  setSelectedStreams: (config: { id: string; devices: number } | null) => void;
  setSelectedExperience: (config: { id: string; hasAds: boolean } | null) => void;
  setChannelConfig: (config: ChannelConfig) => void;
  removeChannelConfig: (subsiteId: string) => void;
  setSelectedBundles: (bundles: { id: string; devices: number }[]) => void;
  setDiscountCode: (code: string) => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      selectedStreams: null,
      selectedExperience: null,
      selectedChannels: [],
      selectedBundles: [],
      discountCode: "",

      setSelectedStreams: (config) => set({ selectedStreams: config }),
      setSelectedExperience: (config) => set({ selectedExperience: config }),

      // Add or replace a channel config by subsiteId
      setChannelConfig: (config) =>
        set((state) => ({
          selectedChannels: [
            ...state.selectedChannels.filter(
              (c) => c.subsiteId !== config.subsiteId
            ),
            config,
          ],
        })),

      // Remove a channel config
      removeChannelConfig: (subsiteId) =>
        set((state) => ({
          selectedChannels: state.selectedChannels.filter(
            (c) => c.subsiteId !== subsiteId
          ),
        })),

      setSelectedBundles: (bundles) => set({ selectedBundles: bundles }),
      setDiscountCode: (code) => set({ discountCode: code }),

      reset: () =>
        set({
          selectedStreams: null,
          selectedExperience: null,
          selectedChannels: [],
          selectedBundles: [],
          discountCode: "",
        }),
    }),
    {
      name: "kolbo-subscription-storage",
    }
  )
);
