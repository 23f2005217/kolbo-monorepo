// ==================== DATABASE QUERIES ====================
// Modular exports for all entity queries

export { videoQueries } from './videos';
export { playlistQueries } from './playlists';
export { liveStreamQueries } from './live-streams';
export { categoryQueries } from './categories';
export { subscriptionPlanQueries } from './subscription-plans';
export { creatorQueries } from './creators';
export { userQueries } from './users';
export { analyticsQueries } from './analytics';
export { bundleQueries } from './bundles';
export { subsiteQueries } from './subsites';
export { filterQueries } from './filters';
export { adCampaignQueries } from './ad-campaigns';
export { adCreativeQueries } from './ad-creatives';
export { adAnalyticsQueries } from './ad-analytics';
export { adInventoryQueries } from './ad-inventory';
export { userSubscriptionQueries } from './user-subscriptions';

// Default export for backward compatibility
import { videoQueries } from './videos';
import { playlistQueries } from './playlists';
import { liveStreamQueries } from './live-streams';
import { categoryQueries } from './categories';
import { subscriptionPlanQueries } from './subscription-plans';
import { creatorQueries } from './creators';
import { userQueries } from './users';
import { analyticsQueries } from './analytics';
import { filterQueries } from './filters';
import { adCampaignQueries } from './ad-campaigns';
import { adCreativeQueries } from './ad-creatives';
import { adAnalyticsQueries } from './ad-analytics';
import { adInventoryQueries } from './ad-inventory';
import { userSubscriptionQueries } from './user-subscriptions';

export default {
  video: videoQueries,
  playlist: playlistQueries,
  liveStream: liveStreamQueries,
  category: categoryQueries,
  subscriptionPlan: subscriptionPlanQueries,
  creator: creatorQueries,
  user: userQueries,
  analytics: analyticsQueries,
  filter: filterQueries,
  adCampaign: adCampaignQueries,
  adCreative: adCreativeQueries,
  adAnalytics: adAnalyticsQueries,
  adInventory: adInventoryQueries,
  userSubscription: userSubscriptionQueries,
};
