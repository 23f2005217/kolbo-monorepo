'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Users, Loader2, Play, CheckCircle, Monitor } from 'lucide-react';
import { BrowseHeader } from '@/components/browse-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserAuthContext } from '@/components/user-auth-provider';
import { useWatchVideo } from '@/hooks/use-watch-video';
import { ChannelAccentProvider } from '@/contexts/channel-accent-context';

const VIEWER_OPTIONS = ['1', '2', '3', '4', '5', '6+'];
const DEFAULT_DESCRIPTION =
  'An inspiring and educational journey that brings Torah values to life through engaging storytelling and meaningful lessons for the whole family.';

interface EntitlementStatus {
  hasAccess: boolean;
  entitlement: {
    type: string;
    expiresAt: string | null;
    remainingHours?: number | null;
    remainingDays?: number | null;
    isPermanent?: boolean;
    expired?: boolean;
  } | null;
  message?: string;
}

function WatchDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const channelSlug = searchParams.get('channel');
  const id = typeof params.id === 'string' ? params.id : params.id?.[0] ?? '';

  const { video, loading, gatingType, rentalOffers, purchaseOffers } = useWatchVideo(id);

  // Derive available tiers from offers
  const availableTiers = Array.from(new Set([
    ...rentalOffers.map((o: any) => o.tierLabel).filter(Boolean),
    ...purchaseOffers.map((o: any) => o.tierLabel).filter(Boolean)
  ])) as string[];

  const [viewerCount, setViewerCount] = useState<string>('');
  const [streamCount, setStreamCount] = useState<string>('1');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<string | null>(null);
  const [entitlementStatus, setEntitlementStatus] = useState<EntitlementStatus | null>(null);
  const [entitlementLoading, setEntitlementLoading] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<{id: string, sessions: number} | null>(null);

  // Get max simultaneous streams from video (0 means unlimited)
  const maxStreams = video?.maxSimultaneousStreams ?? 0;
  const streamOptions = maxStreams === 0 
    ? [1, 2, 3, 4, 5] 
    : Array.from({ length: maxStreams }, (_, i) => i + 1);

  const { isAuthenticated, loading: authLoading, userProfile } = useUserAuthContext();

  // Auto-select first tier if available
  useEffect(() => {
    if (availableTiers.length > 0 && !viewerCount) {
      setViewerCount(availableTiers[0]);
    }
  }, [availableTiers, viewerCount]);

  // Protect the route - require login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/login?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, authLoading, router]);

  // Check user's entitlement status
  useEffect(() => {
    const checkEntitlement = async () => {
      if (!id) return;

      setEntitlementLoading(true);
      try {
        const res = await fetch(`/api/videos/${id}/entitlement`);
        if (res.ok) {
          const data = await res.json();
          setEntitlementStatus(data);
        }
      } catch (error) {
        console.error('Error checking entitlement:', error);
      } finally {
        setEntitlementLoading(false);
      }
    };

    if (isAuthenticated) {
      checkEntitlement();
    }
  }, [id, isAuthenticated]);

  // Fetch device/session info for debugging
  useEffect(() => {
    const fetchDeviceInfo = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await fetch('/api/user/sessions');
        if (res.ok) {
          const data = await res.json();
          setDeviceInfo(data);
        }
      } catch (e) {
        console.error('Failed to fetch device info:', e);
      }
    };
    fetchDeviceInfo();
  }, [isAuthenticated]);

  const title = video?.title ?? 'Video';
  const description = video?.shortDescription || video?.descriptionRich || DEFAULT_DESCRIPTION;

  // Check if user already has access
  const hasExistingAccess = entitlementStatus?.hasAccess === true;
  const entitlement = entitlementStatus?.entitlement;

  // Get video thumbnail (always public)
  const horizontalImage = video?.images?.find(img => img.imageType === 'horizontal');
  const heroImage = video?.images?.find(img => img.imageType === 'hero');
  const verticalImage = video?.images?.find(img => img.imageType === 'vertical');
  const thumbnailImage = horizontalImage || heroImage || verticalImage;
  const muxPublicPlaybackId = video?.assets?.[0]?.muxPublicPlaybackId;  // Public - for thumbnails

  // Build thumbnail URL (public, no token needed)
  let thumbnailUrl = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80';
  if (thumbnailImage) {
    thumbnailUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${thumbnailImage.storageBucket}/${thumbnailImage.storagePath}`;
  } else if (muxPublicPlaybackId) {
    thumbnailUrl = `https://image.mux.com/${muxPublicPlaybackId}/thumbnail.jpg?width=800&fit_mode=preserve`;
  }

  // Filter offers based on selected tier
  const displayedRentalOffers = viewerCount 
    ? rentalOffers.filter((o: any) => o.tierLabel === viewerCount || (!o.tierLabel && availableTiers.length === 0))
    : (availableTiers.length === 0 ? rentalOffers : []);

  const displayedPurchaseOffer = viewerCount
    ? purchaseOffers.find(o => o.tierLabel === viewerCount) || (availableTiers.length === 0 ? purchaseOffers[0] : null)
    : (availableTiers.length === 0 ? purchaseOffers[0] : null);

  // Only show pricing if user doesn't have access
  const showPricing = !hasExistingAccess && (!video?.isFree || (video.hasAds && gatingType === 'rental_or_purchase'));
  const showViewerDropdown = showPricing && availableTiers.length > 0;
  const showRentalOptions = (viewerCount || availableTiers.length === 0) && displayedRentalOffers.length > 0;
  const showBuyNow = displayedPurchaseOffer != null;


  // Format remaining time or access source
  const formatAccessStatus = () => {
    if (!entitlement) return null;
    
    let text = '';
    if (entitlement.type === 'subscription') {
      text = `Covered by your ${(entitlement as any).sourceName || 'subscription'}`;
    } else if (entitlement.isPermanent) {
      text = 'Purchased - Unlimited access';
    } else if (entitlement.remainingDays && entitlement.remainingDays > 1) {
      text = `${entitlement.remainingDays} days remaining`;
    } else if (entitlement.remainingHours) {
      if (entitlement.remainingHours > 24) {
        text = `${Math.ceil(entitlement.remainingHours / 24)} days remaining`;
      } else {
        text = `${entitlement.remainingHours} hours remaining`;
      }
    }
    
    return text || null;
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  
  // Calculate price based on device count
  const calculatePrice = (baseCents: number, perDeviceCents: number | undefined | null, devices: number) => {
    const safeBaseCents = baseCents || 0;
    const safePerDeviceCents = perDeviceCents || 0;
    const safeDevices = devices || 1;
    if (safeDevices <= 1) return safeBaseCents;
    return safeBaseCents + ((safeDevices - 1) * safePerDeviceCents);
  };
  
  const formatRentalLabel = (days: number) => {
    if (days === 1) return 'Rent for 24 hrs';
    if (days === 7) return 'Rent for 7 days';
    return `Rent for ${days} days`;
  };

  const backHref = channelSlug ? `/browse?channel=${channelSlug}` : '/browse';

  // Handle checkout for rental or purchase
  const handleCheckout = async (offerId: string, calculatedPriceCents?: number) => {
    setIsCheckoutLoading(offerId);
    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: id,
          offerId,
          userId: userProfile?.id,
          calculatedPriceCents,
          maxSimultaneousStreams: parseInt(streamCount),
          successUrl: `${window.location.origin}/watch/${id}/play?checkout_session={CHECKOUT_SESSION_ID}${channelSlug ? `&channel=${channelSlug}` : ''}`,
          cancelUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsCheckoutLoading(null);
    }
  };

  return (
    <ChannelAccentProvider channelSlug={channelSlug}>
      <div className="min-h-screen bg-[#0a0b14] text-white">
        <BrowseHeader />

        <div className="relative flex min-h-[calc(100vh-3.5rem)] flex-col md:flex-row">
          <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center px-4 py-8 md:flex-[1_1_60%] md:px-6 md:py-10 lg:px-8 lg:py-12">
            <Link
              href={backHref}
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white"
            >
              <ChevronLeft className="size-4" />
              Back
            </Link>

            {loading || entitlementLoading || authLoading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                {/* Video Thumbnail */}
                <div className="mb-6 overflow-hidden rounded-xl">
                  <div
                    className="aspect-video w-full max-w-md bg-cover bg-center"
                    style={{ backgroundImage: `url(${thumbnailUrl})` }}
                  />
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
                  {title}
                </h1>
                <div 
                  className="mt-4 text-base leading-relaxed text-white/90"
                  dangerouslySetInnerHTML={{ __html: description }}
                />

                {/* User already has access - show Play button and remaining time */}
                {hasExistingAccess && (
                  <div className="mt-8">
                    {/* Show access info */}
                    {formatAccessStatus() && (
                      <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-green-500/20 px-4 py-2 text-green-400">
                        <CheckCircle className="size-5" />
                        <span className="font-medium">{formatAccessStatus()}</span>
                      </div>
                    )}
                    <div>
                      <button
                        type="button"
                        onClick={() => router.push(`/watch/${id}/play${channelSlug ? `?channel=${channelSlug}` : ''}`)}
                        className="inline-flex items-center gap-3 rounded-xl bg-[#4A90FF] px-8 py-4 font-semibold text-white transition hover:bg-[#3b7fe6]"
                      >
                        <Play className="size-6" fill="currentColor" />
                        Play Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Free / Free with Ads: show Watch button */}
                {!hasExistingAccess && (gatingType === 'free' || gatingType === 'free_with_ads') && (
                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={() => router.push(`/watch/${id}/play${channelSlug ? `?channel=${channelSlug}` : ''}`)}
                      className="rounded-xl bg-[#4A90FF] px-8 py-4 font-semibold text-white transition hover:bg-[#3b7fe6]"
                    >
                      {gatingType === 'free_with_ads' ? 'Watch with Ads' : 'Watch Now'}
                    </button>
                  </div>
                )}

                {/* Subscription only: Join Kolbo */}
                {!hasExistingAccess && gatingType === 'subscription_only' && (
                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={() => router.push(isAuthenticated ? '/signup?step=2' : '/login')}
                      className="rounded-xl bg-[#4A90FF] px-8 py-4 font-semibold text-white transition hover:bg-[#3b7fe6]"
                    >
                      Join Kolbo to Watch
                    </button>
                  </div>
                )}

                {/* Rental/Purchase: Dynamic pricing widget - only show if user doesn't have access */}
                {!hasExistingAccess && gatingType === 'rental_or_purchase' && (
                  <>
                    {showViewerDropdown && (
                      <div className="mt-8">
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                          <Users className="size-4" aria-hidden />
                          How many people will be watching?
                        </label>
                        <Select value={viewerCount || undefined} onValueChange={setViewerCount}>
                          <SelectTrigger className="w-full max-w-xs rounded-lg border-white/20 bg-white/10 py-3 text-white placeholder:text-white/50 [&>span]:text-white [&>svg]:text-white/70">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="border-white/20 bg-[#0a0b14] text-white">
                            {availableTiers.map((opt) => (
                              <SelectItem
                                key={opt}
                                value={opt}
                                className="focus:bg-white/10 focus:text-white data-[highlight]:bg-white/10 data-[highlight]:text-white"
                              >
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {gatingType === 'rental_or_purchase' && (
                      <div className="mt-6">
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                          <Monitor className="size-4" aria-hidden />
                          How many devices will you watch on?
                        </label>
                        <Select value={streamCount} onValueChange={setStreamCount}>
                          <SelectTrigger className="w-full max-w-xs rounded-lg border-white/20 bg-white/10 py-3 text-white placeholder:text-white/50 [&>span]:text-white [&>svg]:text-white/70">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-white/20 bg-[#0a0b14] text-white">
                            {streamOptions.map((opt) => (
                              <SelectItem
                                key={opt}
                                value={opt.toString()}
                                className="focus:bg-white/10 focus:text-white data-[highlight]:bg-white/10 data-[highlight]:text-white"
                              >
                                {opt} {opt === 1 ? 'device' : 'devices'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {maxStreams > 0 && (
                          <p className="mt-1 text-xs text-white/60">
                            Maximum {maxStreams} simultaneous streams allowed
                          </p>
                        )}
                      </div>
                    )}

                    {showRentalOptions && (
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        {displayedRentalOffers.map((offer) => {
                          const calculatedPrice = calculatePrice(
                            offer.amountCents,
                            offer.pricePerDeviceCents,
                            parseInt(streamCount)
                          );
                          return (
                            <button
                              key={offer.id}
                              type="button"
                              disabled={isCheckoutLoading === offer.id}
                              onClick={() => handleCheckout(offer.id, calculatedPrice)}
                              className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-4 text-left font-medium text-white transition hover:bg-white/15 disabled:opacity-50"
                            >
                              {isCheckoutLoading === offer.id ? (
                                <>
                                  <Loader2 className="size-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  {formatRentalLabel(offer.rentalDurationDays ?? 1)} — {formatPrice(calculatedPrice)}
                                  {parseInt(streamCount) > 1 && (
                                    <span className="text-xs text-white/60 ml-1">({streamCount} devices)</span>
                                  )}
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {showBuyNow && (
                      <div className="mt-6">
                        {(() => {
                          const calculatedPrice = calculatePrice(
                            displayedPurchaseOffer.amountCents,
                            displayedPurchaseOffer.pricePerDeviceCents,
                            parseInt(streamCount)
                          );
                          return (
                            <button
                              type="button"
                              disabled={isCheckoutLoading === displayedPurchaseOffer.id}
                              onClick={() => handleCheckout(displayedPurchaseOffer.id, calculatedPrice)}
                              className="flex items-center justify-center gap-2 rounded-xl bg-[#4A90FF] px-8 py-4 font-semibold text-white transition hover:bg-[#3b7fe6] disabled:opacity-50"
                            >
                              {isCheckoutLoading === displayedPurchaseOffer.id ? (
                                <>
                                  <Loader2 className="size-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>Buy Now — {formatPrice(calculatedPrice)}</>
                              )}
                            </button>
                          );
                        })()}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          <div
            className="absolute right-0 top-0 h-full w-full flex-shrink-0 bg-[#0a0b14] md:relative md:flex-[1_1_40%]"
            aria-hidden
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b14] via-[#0a0b14]/95 to-transparent md:from-transparent md:via-[#0a0b14]/80 md:to-[#0a0b14]" />
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
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

export default function WatchDetailsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0a0b14]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    }>
      <WatchDetailsContent />
    </Suspense>
  );
}
