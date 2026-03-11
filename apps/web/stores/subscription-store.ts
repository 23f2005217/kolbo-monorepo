import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SubscriptionState {
  selectedStreams: string | null;
  selectedExperience: string | null;
  selectedChannels: string[];
  selectedBundles: string[];
  discountCode: string;
  
  setSelectedStreams: (id: string | null) => void;
  setSelectedExperience: (id: string | null) => void;
  setSelectedChannels: (ids: string[]) => void;
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
      discountCode: '',

      setSelectedStreams: (id) => set({ selectedStreams: id }),
      setSelectedExperience: (id) => set({ selectedExperience: id }),
      setSelectedChannels: (ids) => set({ selectedChannels: ids }),
      setSelectedBundles: (ids) => set({ selectedBundles: ids }),
      setDiscountCode: (code) => set({ discountCode: code }),
      reset: () => set({
        selectedStreams: null,
        selectedExperience: null,
        selectedChannels: [],
        selectedBundles: [],
        discountCode: '',
      }),
    }),
    {
      name: 'kolbo-subscription-storage',
    }
  )
);
