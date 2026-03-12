import prisma from '../prisma';

export const userSubscriptionQueries = {
  findActiveByUserIdAndSubsite: async (userId: string, subsiteId: string) => {
    return prisma.userSubscription.findFirst({
      where: { userId, subsiteId, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
  },

  findActiveByUserId: async (userId: string) => {
    return prisma.userSubscription.findMany({
      where: { userId, status: 'active' },
      include: { subsite: true },
    });
  },

  create: async (data: {
    userId: string;
    profileId: string;
    subsiteId: string;
    stripeSubscriptionId?: string | null;
    maxDevices?: number | null;
    hasAds?: boolean | null;
  }) => {
    return prisma.userSubscription.create({
      data: {
        userId: data.userId,
        profileId: data.profileId,
        subsiteId: data.subsiteId,
        stripeSubscriptionId: data.stripeSubscriptionId ?? null,
        status: 'active',
        maxDevices: data.maxDevices ?? null,
        hasAds: data.hasAds ?? null,
      },
    });
  },
};
