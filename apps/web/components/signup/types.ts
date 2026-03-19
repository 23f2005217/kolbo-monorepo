export interface Plan {
  id: string;
  name: string;
  description: string | null;
  planType: string | null;
  tier: string | null;
  maxDevices: number | null;
  hasAds: boolean;
  priceAmount: number | null;
}

export interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthlyPrice: number | null;
  baseDevices?: number | null;
  extraDevicePrice?: number | null;
  maxTotalDevices?: number | null;
  withAdsDiscount?: number | null;
  category: string | null;
  thumbnailStorageBucket: string | null;
  thumbnailStoragePath: string | null;
}

export interface ChannelConfig {
  subsiteId: string;
  devices: number;
  hasAds: boolean;
  calculatedPriceCents: number;
}

export interface Bundle {
  id: string;
  name: string;
  description: string | null;
  priceAmount: number | null;
  originalPrice: number | null;
  baseDevices: number | null;
  extraDevicePrice: number | null;
  maxTotalDevices: number | null;
  discountPercent: number | null;
  bundleSubsites: { subsite: Channel }[];
}

export interface SelectedStream {
  id: string;
  devices: number;
}

export interface SelectedExperience {
  id: string;
  hasAds: boolean;
}

export interface SelectedBundle {
  id: string;
  devices: number;
}
