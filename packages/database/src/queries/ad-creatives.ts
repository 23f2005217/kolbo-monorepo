import prisma from '../prisma';

export const adCreativeQueries = {
  findByAdvertiserId: async (advertiserId: string) => {
    return prisma.adCreative.findMany({
      where: { advertiserId },
      orderBy: { createdAt: 'desc' },
    });
  },

  findByCampaignId: async (campaignId: string) => {
    return prisma.adCreative.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
    });
  },

  findAll: async () => {
    return prisma.adCreative.findMany({
      include: {
        advertiser: { select: { id: true, companyName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById: async (id: string) => {
    return prisma.adCreative.findUnique({
      where: { id },
      include: {
        advertiser: { select: { id: true, companyName: true } },
        campaign: { select: { id: true, name: true } },
      },
    });
  },

  create: async (data: {
    advertiserId: string;
    campaignId?: string;
    name: string;
    storageBucket?: string;
    storagePath?: string;
    muxUploadId?: string;
    durationSeconds?: number;
    width?: number;
    height?: number;
    status?: string;
  }) => {
    return prisma.adCreative.create({
      data: {
        ...data,
        status: data.status || 'pending',
      },
    });
  },

  update: async (id: string, data: Partial<{
    name: string;
    campaignId: string | null;
    durationSeconds: number;
    width: number;
    height: number;
    status: string;
  }>) => {
    return prisma.adCreative.update({
      where: { id },
      data,
    });
  },

  updateStatus: async (id: string, status: string) => {
    return prisma.adCreative.update({
      where: { id },
      data: { status },
    });
  },

  delete: async (id: string) => {
    return prisma.adCreative.delete({ where: { id } });
  },

  getStats: async (creativeId: string) => {
    const stats = await prisma.adCreativeAnalytics.aggregate({
      where: { creativeId },
      _sum: {
        impressions: true,
        clicks: true,
      },
    });

    return {
      impressions: stats._sum.impressions || 0,
      clicks: stats._sum.clicks || 0,
    };
  },
};
