import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

interface RentalOption {
  duration: number;
  price: number;
  pricePerDevice: number;
  tierLabel?: string;
  maxStreams?: number;
}

interface PurchaseOption {
  price: number;
  pricePerDevice: number;
  tierLabel?: string;
  maxStreams?: number;
}

interface FormData {
  title: string;
  descriptionRich: string;
  shortDescription: string;
  status: "published" | "unpublished" | "scheduled";
  categoryId: string;
  subsiteId: string;
  isFree: boolean;
  hasAds: boolean;
  adsMode: "free_with_ads" | "cheaper_with_ads" | null;
  adsPlacement: ("pre_roll" | "mid_roll")[];
  adInternalTags: string[];
  adPricing: "standard" | "premium";
  publishScheduledAt: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  bundles: string[];
  seoKeywords: string[];
  searchTags: string[];
  subscriptionPlanIds: string[];
  creators: string[];
  filterValueIds: string[];
  images: Array<{imageType: "horizontal" | "vertical" | "hero", storageBucket: string, storagePath: string}>;
  rentalOptions: RentalOption[];
  purchaseOptions: PurchaseOption[];
  trailerVideoId: string;
  midRollMinutes: number;
  minimumAge: number;
  geoBlocks: string[];
  maxSimultaneousStreams: number;
  adTagUrl: string;
}

interface VideoFormState {
  formData: FormData;
  showBundles: boolean;
  deleteDialogOpen: boolean;
  replaceDialogOpen: boolean;
  downloadDialogOpen: boolean;
  errorDialogOpen: boolean;
  errorMessage: string;
  downloadStatus: { type: 'preparing' | 'downloading' | 'error'; message: string } | null;
  thumbnailUploading: boolean;
  imageUrls: Record<string, string>;
  setFormData: (data: Partial<FormData>) => void;
  setPartialFormData: (key: keyof FormData, value: any) => void;
  setShowBundles: (show: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  setReplaceDialogOpen: (open: boolean) => void;
  setDownloadDialogOpen: (open: boolean) => void;
  setErrorDialogOpen: (open: boolean) => void;
  setErrorMessage: (message: string) => void;
  setDownloadStatus: (status: any) => void;
  setThumbnailUploading: (uploading: boolean) => void;
  setImageUrls: (urls: Record<string, string>) => void;
  resetForm: () => void;
  initializeForm: (video: any) => void;
}

const initialFormData: FormData = {
  title: "",
  descriptionRich: "",
  shortDescription: "",
  status: "unpublished",
  categoryId: "",
  subsiteId: "",
  isFree: true,
  hasAds: false,
  adsMode: "free_with_ads",
  adsPlacement: [] as ("pre_roll" | "mid_roll")[],
  adInternalTags: [],
  adPricing: "standard",
  publishScheduledAt: "",
  seoTitle: "",
  seoDescription: "",
  slug: "",
  bundles: [],
  seoKeywords: [],
  searchTags: [],
  subscriptionPlanIds: [],
  creators: [],
  filterValueIds: [],
  images: [],
  rentalOptions: [],
  purchaseOptions: [],
  trailerVideoId: "",
  midRollMinutes: 10,
  minimumAge: 0,
  geoBlocks: [],
  maxSimultaneousStreams: 0,
  adTagUrl: "",
};

export const useVideoFormStore = create<VideoFormState>((set) => ({
  formData: initialFormData,
  showBundles: false,
  deleteDialogOpen: false,
  replaceDialogOpen: false,
  downloadDialogOpen: false,
  errorDialogOpen: false,
  errorMessage: "",
  downloadStatus: null,
  thumbnailUploading: false,
  imageUrls: {},
  setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
  setPartialFormData: (key, value) => set((state) => ({
    formData: { ...state.formData, [key]: value }
  })),
  setShowBundles: (showBundles) => set({ showBundles }),
  setDeleteDialogOpen: (deleteDialogOpen) => set({ deleteDialogOpen }),
  setReplaceDialogOpen: (replaceDialogOpen) => set({ replaceDialogOpen }),
  setDownloadDialogOpen: (downloadDialogOpen) => set({ downloadDialogOpen }),
  setErrorDialogOpen: (errorDialogOpen) => set({ errorDialogOpen }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setDownloadStatus: (downloadStatus) => set({ downloadStatus }),
  setThumbnailUploading: (thumbnailUploading) => set({ thumbnailUploading }),
  setImageUrls: (imageUrls) => set({ imageUrls }),
  resetForm: () => set({ formData: initialFormData, imageUrls: {} }),
  initializeForm: (video) => set({
    formData: {
      title: video.title || "",
      descriptionRich: video.descriptionRich || "",
      shortDescription: video.shortDescription || "",
      status: video.status || "unpublished",
      categoryId: video.categoryId || "",
      subsiteId: video.subsiteId || "",
      isFree: video.isFree ?? true,
      hasAds: video.hasAds || false,
      adsMode: video.adsMode || "free_with_ads",
      adsPlacement: Array.isArray(video.adsPlacement) ? video.adsPlacement : (video.adsPlacement ? [video.adsPlacement] : []),
      adInternalTags: [],
      adPricing: (video as any).adPricing || "standard",
      publishScheduledAt: video.publishScheduledAt || "",
      seoTitle: video.seoTitle || "",
      seoDescription: video.seoDescription || "",
      slug: video.slug || "",
      bundles: video.bundles?.map((b: any) => b.bundleId) || [],
      seoKeywords: video.seoKeywords || [],
      searchTags: video.searchTags?.map((t: any) => t.searchTag?.tag).filter(Boolean) || [],
      subscriptionPlanIds: video.subscriptionPlans?.map((sp: any) => sp.subscriptionPlanId) || [],
      creators: video.creators?.map((c: any) => c.creatorId) || [],
      filterValueIds: video.filterValues?.map((f: any) => f.filterValueId) || [],
      images: video.images?.map((img: any) => ({
        imageType: img.imageType,
        storageBucket: img.storageBucket,
        storagePath: img.storagePath,
      })) || [],
      rentalOptions: video.offers?.filter((o: any) => o.offerType === 'rental').map((o: any) => ({
        duration: o.rentalDurationDays,
        price: o.amountCents / 100,
        pricePerDevice: (o.pricePerDeviceCents || 0) / 100,
        tierLabel: o.tierLabel || "",
        maxStreams: o.maxSimultaneousStreams || 0,
      })) || [],
      purchaseOptions: video.offers?.filter((o: any) => o.offerType === 'purchase').map((o: any) => ({
        price: o.amountCents / 100,
        pricePerDevice: (o.pricePerDeviceCents || 0) / 100,
        tierLabel: o.tierLabel || "",
        maxStreams: o.maxSimultaneousStreams || 0,
      })) || [],
      trailerVideoId: video.trailerVideoId || "",
      midRollMinutes: video.midRollIntervalMinutes || 10,
      minimumAge: video.minimumAge || 0,
      geoBlocks: video.geoBlocks?.map((g: any) => g.countryCode) || [],
      maxSimultaneousStreams: video.maxSimultaneousStreams || 0,
      adTagUrl: video.adTagUrl || "",
    }
  }),
}));
