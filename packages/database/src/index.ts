// Re-export prisma client
export { prisma, prisma as default } from './prisma';

// Re-export all query modules
export { videoQueries } from './queries/videos';
export { playlistQueries } from './queries/playlists';
export { liveStreamQueries } from './queries/live-streams';
export { categoryQueries } from './queries/categories';
export { subscriptionPlanQueries } from './queries/subscription-plans';
export { creatorQueries } from './queries/creators';
export { userQueries } from './queries/users';
export { analyticsQueries } from './queries/analytics';
export { bundleQueries } from './queries/bundles';
export { subsiteQueries } from './queries/subsites';
export { filterQueries } from './queries/filters';
export { adCampaignQueries } from './queries/ad-campaigns';
export { adCreativeQueries } from './queries/ad-creatives';
export { adAnalyticsQueries } from './queries/ad-analytics';
export { adInventoryQueries } from './queries/ad-inventory';
export { calendarEventQueries } from './queries/calendar';
export { couponQueries, pushNotificationQueries, upsellOfferQueries } from './queries/marketing';
export { artistQueries, revShareAgreementQueries } from './queries/revshare';
export { transactionQueries } from './queries/transactions';
