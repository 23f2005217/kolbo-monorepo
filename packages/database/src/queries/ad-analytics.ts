import prisma from '../prisma';

export const adAnalyticsQueries = {
  recordImpression: async (campaignId: string, creativeId: string, date: Date = new Date()) => {
    const dateOnly = new Date(date.toDateString());

    await prisma.adCampaignAnalytics.upsert({
      where: { campaignId_date: { campaignId, date: dateOnly } },
      create: { campaignId, date: dateOnly, impressions: 1 },
      update: { impressions: { increment: 1 } },
    });

    await prisma.adCreativeAnalytics.upsert({
      where: { creativeId_date: { creativeId, date: dateOnly } },
      create: { creativeId, date: dateOnly, impressions: 1 },
      update: { impressions: { increment: 1 } },
    });
  },

  recordClick: async (campaignId: string, creativeId: string, date: Date = new Date()) => {
    const dateOnly = new Date(date.toDateString());

    await prisma.adCampaignAnalytics.upsert({
      where: { campaignId_date: { campaignId, date: dateOnly } },
      create: { campaignId, date: dateOnly, clicks: 1 },
      update: { clicks: { increment: 1 } },
    });

    await prisma.adCreativeAnalytics.upsert({
      where: { creativeId_date: { creativeId, date: dateOnly } },
      create: { creativeId, date: dateOnly, clicks: 1 },
      update: { clicks: { increment: 1 } },
    });
  },

  recordConversion: async (campaignId: string, date: Date = new Date()) => {
    const dateOnly = new Date(date.toDateString());

    await prisma.adCampaignAnalytics.upsert({
      where: { campaignId_date: { campaignId, date: dateOnly } },
      create: { campaignId, date: dateOnly, conversions: 1 },
      update: { conversions: { increment: 1 } },
    });
  },

  recordSpend: async (campaignId: string, amountCents: number, date: Date = new Date()) => {
    const dateOnly = new Date(date.toDateString());

    const existing = await prisma.adCampaignAnalytics.findUnique({
      where: { campaignId_date: { campaignId, date: dateOnly } },
    });

    const impressions = existing?.impressions || 0;
    const clicks = existing?.clicks || 0;
    const spend = (existing?.spend || 0) + amountCents;

    await prisma.adCampaignAnalytics.upsert({
      where: { campaignId_date: { campaignId, date: dateOnly } },
      create: {
        campaignId,
        date: dateOnly,
        spend: amountCents,
        ctr: 0,
        cpm: 0,
        cpc: 0,
      },
      update: {
        spend,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
        cpc: clicks > 0 ? spend / clicks : 0,
      },
    });
  },

  getCampaignStats: async (campaignId: string, startDate?: Date, endDate?: Date) => {
    const where: any = { campaignId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate.toDateString());
      if (endDate) where.date.lte = new Date(endDate.toDateString());
    }

    const dailyStats = await prisma.adCampaignAnalytics.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    const totals = dailyStats.reduce(
      (acc, day) => ({
        impressions: acc.impressions + day.impressions,
        clicks: acc.clicks + day.clicks,
        conversions: acc.conversions + day.conversions,
        spend: acc.spend + day.spend,
      }),
      { impressions: 0, clicks: 0, conversions: 0, spend: 0 }
    );

    return {
      totals,
      daily: dailyStats,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      cpm: totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0,
      cpc: totals.clicks > 0 ? totals.spend / totals.clicks : 0,
    };
  },

  getAdvertiserStats: async (advertiserId: string, startDate?: Date, endDate?: Date) => {
    const campaigns = await prisma.adCampaign.findMany({
      where: { advertiserId },
      select: { id: true },
    });

    const campaignIds = campaigns.map((c) => c.id);

    if (campaignIds.length === 0) {
      return {
        totals: { impressions: 0, clicks: 0, conversions: 0, spend: 0 },
        daily: [],
        ctr: 0,
        cpm: 0,
        cpc: 0,
      };
    }

    const where: any = { campaignId: { in: campaignIds } };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate.toDateString());
      if (endDate) where.date.lte = new Date(endDate.toDateString());
    }

    const dailyStats = await prisma.adCampaignAnalytics.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    const totals = dailyStats.reduce(
      (acc, day) => ({
        impressions: acc.impressions + day.impressions,
        clicks: acc.clicks + day.clicks,
        conversions: acc.conversions + day.spend,
        spend: acc.spend + day.spend,
      }),
      { impressions: 0, clicks: 0, conversions: 0, spend: 0 }
    );

    return {
      totals,
      daily: dailyStats,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      cpm: totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0,
      cpc: totals.clicks > 0 ? totals.spend / totals.clicks : 0,
    };
  },
};
