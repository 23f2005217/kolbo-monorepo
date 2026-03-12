import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ChannelConfig {
  subsiteId: string;
  devices: number; // 3 or 5
  hasAds: boolean;
  calculatedPriceCents: number;
}

interface SubscriptionState {
  selectedStreams: string | null;
  selectedExperience: string | null;
  selectedChannels: ChannelConfig[]; // structured channel configs
  selectedBundles: string[];
  discountCode: string;

  setSelectedStreams: (id: string | null) => void;
  setSelectedExperience: (id: string | null) => void;
  setChannelConfig: (config: ChannelConfig) => void;
  removeChannelConfig: (subsiteId: string) => void;
  setSelectedBundles: (ids: string[]) => void;
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

      setSelectedStreams: (id) => set({ selectedStreams: id }),
      setSelectedExperience: (id) => set({ selectedExperience: id }),

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

      setSelectedBundles: (ids) => set({ selectedBundles: ids }),
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
