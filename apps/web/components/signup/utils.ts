import type { Channel } from "./types";

export function formatPrice(cents: number | null | undefined) {
  if (!cents && cents !== 0) return "$0.00";
  return `$${(Math.abs(cents) / 100).toFixed(2)}`;
}

export function calcChannelPrice(
  ch: Channel,
  devices: number,
  hasAds: boolean
): number {
  let p = ch.monthlyPrice || 0;
  const base = ch.baseDevices || 3;
  if (devices > base) {
    p += (devices - base) * (ch.extraDevicePrice || 0);
  }
  if (hasAds) p -= ch.withAdsDiscount || 0;
  return Math.max(0, p);
}
