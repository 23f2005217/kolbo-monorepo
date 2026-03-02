import { create } from 'zustand';

interface VideoItem {
  id: string;
  videoId: string;
  title: string;
  thumbnailUrl?: string;
  position: number;
  dripDays: number;
}

interface RentalOption {
  duration: number;
  price: number;
  tierLabel?: string;
  maxStreams?: number;
}

interface PurchaseOption {
  price: number;
  tierLabel?: string;
  maxStreams?: number;
}

interface FormData {
  title: string;
  descriptionRich: string;
  shortDescription: string;
  status: "published" | "unpublished" | "scheduled";
  isFree: boolean;
  categoryId: string;
  trailerVideoId: string;
  publishScheduledAt: string;
  rentalOptions: RentalOption[];
  purchaseOptions: PurchaseOption[];
  creatorIds: string[];
  categoryIds: string[];
  filterValueIds: string[];
  videos: VideoItem[];
  thumbnailStorageBucket?: string;
  thumbnailStoragePath?: string;
}

interface PlaylistFormState {
  formData: FormData;
  imageUrls: Record<string, string>;
  saving: boolean;
  loading: boolean;
  setFormData: (data: Partial<FormData>) => void;
  setImageUrls: (urls: Record<string, string>) => void;
  setSaving: (saving: boolean) => void;
  setLoading: (loading: boolean) => void;
  initializeForm: (playlist: any) => void;
  resetForm: () => void;
}

const initialFormData: FormData = {
  title: "",
  descriptionRich: "",
  shortDescription: "",
  status: "unpublished",
  isFree: false,
  categoryId: "",
  trailerVideoId: "",
  publishScheduledAt: "",
  rentalOptions: [],
  purchaseOptions: [],
  creatorIds: [],
  categoryIds: [],
  filterValueIds: [],
  videos: [],
};

export const usePlaylistFormStore = create<PlaylistFormState>((set) => ({
  formData: initialFormData,
  imageUrls: {},
  saving: false,
  loading: false,
  setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  setImageUrls: (imageUrls) => set({ imageUrls }),
  setSaving: (saving) => set({ saving }),
  setLoading: (loading) => set({ loading }),
  resetForm: () => set({ formData: initialFormData, imageUrls: {} }),
  initializeForm: (playlist) => set({
    formData: {
      title: playlist.title || "",
      descriptionRich: playlist.descriptionRich || "",
      shortDescription: playlist.shortDescription || "",
      status: playlist.status || "unpublished",
      isFree: playlist.isFree ?? false,
      categoryId: playlist.categoryId || "",
      trailerVideoId: playlist.trailerVideoId || "",
      publishScheduledAt: playlist.publishScheduledAt || "",
      rentalOptions: playlist.offers?.filter((o: any) => o.offerType === 'rental').map((o: any) => ({
        duration: o.rentalDurationDays,
        price: o.amountCents / 100,
        tierLabel: o.tierLabel || "",
        maxStreams: o.maxSimultaneousStreams || 0,
      })) || [],
      purchaseOptions: playlist.offers?.filter((o: any) => o.offerType === 'purchase').map((o: any) => ({
        price: o.amountCents / 100,
        tierLabel: o.tierLabel || "",
        maxStreams: o.maxSimultaneousStreams || 0,
      })) || [],
      creatorIds: playlist.creators?.map((c: any) => c.creatorId) || [],
      categoryIds: playlist.categories?.map((c: any) => c.categoryId) || [],
      filterValueIds: playlist.filterValues?.map((f: any) => f.filterValueId) || [],
      videos: playlist.items?.map((item: any) => ({
        id: item.id,
        videoId: item.videoId,
        title: item.video?.title || "Unknown Video",
        thumbnailUrl: item.video?.thumbnailUrl,
        position: item.position,
        dripDays: item.dripDays || 0,
      })) || [],
      thumbnailStorageBucket: playlist.thumbnailStorageBucket,
      thumbnailStoragePath: playlist.thumbnailStoragePath,
    }
  }),
}));
