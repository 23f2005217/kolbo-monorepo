import prisma from '../prisma';

export const adCampaignQueries = {
  findByAdvertiserId: async (advertiserId: string, options?: { status?: string }) => {
    const where: any = { advertiserId };
    if (options?.status) where.status = options.status;

    return prisma.adCampaign.findMany({
      where,
      include: {
        targeting: true,
        creatives: true,
        _count: { select: { analytics: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById: async (id: string) => {
    return prisma.adCampaign.findUnique({
      where: { id },
      include: {
        advertiser: { select: { id: true, companyName: true, email: true } },
        targeting: true,
        creatives: true,
      },
    });
  },

  create: async (data: {
    advertiserId: string;
    name: string;
    objective: string;
    description?: string;
    status?: string;
    totalBudget: number;
    dailyBudget?: number;
    startDate: Date;
    endDate?: Date;
    frequencyCap?: number;
    frequencyPeriod?: string;
    targeting?: {
      regions?: string[];
      zipCodes?: string[];
      dmaCodes?: string[];
      ageGroups?: string[];
      genders?: string[];
      channelIds?: string[];
      categoryIds?: string[];
    };
  }) => {
    const { targeting, ...campaignData } = data;

    return prisma.adCampaign.create({
      data: {
        ...campaignData,
        totalBudget: Math.round(campaignData.totalBudget * 100),
        dailyBudget: campaignData.dailyBudget ? Math.round(campaignData.dailyBudget * 100) : null,
        targeting: targeting
          ? {
              create: {
                regions: targeting.regions || [],
                zipCodes: targeting.zipCodes || [],
                dmaCodes: targeting.dmaCodes || [],
                ageGroups: targeting.ageGroups || [],
                genders: targeting.genders || [],
                channelIds: targeting.channelIds || [],
                categoryIds: targeting.categoryIds || [],
              },
            }
          : undefined,
      },
      include: { targeting: true },
    });
  },

  update: async (id: string, data: Partial<{
    name: string;
    objective: string;
    description: string;
    status: string;
    totalBudget: number;
    dailyBudget: number;
    startDate: Date;
    endDate: Date;
    frequencyCap: number;
    frequencyPeriod: string;
    targeting: {
      regions?: string[];
      zipCodes?: string[];
      dmaCodes?: string[];
      ageGroups?: string[];
      genders?: string[];
      channelIds?: string[];
      categoryIds?: string[];
    };
  }>) => {
    const { targeting, ...campaignData } = data;

    const updateData: any = { ...campaignData };
    if (campaignData.totalBudget !== undefined) {
      updateData.totalBudget = Math.round(campaignData.totalBudget * 100);
    }
    if (campaignData.dailyBudget !== undefined) {
      updateData.dailyBudget = campaignData.dailyBudget ? Math.round(campaignData.dailyBudget * 100) : null;
    }

    if (targeting) {
      await prisma.adCampaignTargeting.upsert({
        where: { campaignId: id },
        create: {
          campaignId: id,
          regions: targeting.regions || [],
          zipCodes: targeting.zipCodes || [],
          dmaCodes: targeting.dmaCodes || [],
          ageGroups: targeting.ageGroups || [],
          genders: targeting.genders || [],
          channelIds: targeting.channelIds || [],
          categoryIds: targeting.categoryIds || [],
        },
        update: {
          regions: targeting.regions || [],
          zipCodes: targeting.zipCodes || [],
          dmaCodes: targeting.dmaCodes || [],
          ageGroups: targeting.ageGroups || [],
          genders: targeting.genders || [],
          channelIds: targeting.channelIds || [],
          categoryIds: targeting.categoryIds || [],
        },
      });
    }

    return prisma.adCampaign.update({
      where: { id },
      data: updateData,
      include: { targeting: true },
    });
  },

  updateStatus: async (id: string, status: string) => {
    return prisma.adCampaign.update({
      where: { id },
      data: { status },
    });
  },

  delete: async (id: string) => {
    return prisma.adCampaign.delete({ where: { id } });
  },

  getStats: async (campaignId: string) => {
    const stats = await prisma.adCampaignAnalytics.aggregate({
      where: { campaignId },
      _sum: {
        impressions: true,
        clicks: true,
        conversions: true,
        spend: true,
      },
    });

    return {
      impressions: stats._sum.impressions || 0,
      clicks: stats._sum.clicks || 0,
      conversions: stats._sum.conversions || 0,
      spend: stats._sum.spend || 0,
    };
  },
};
