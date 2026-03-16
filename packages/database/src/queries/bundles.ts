import prisma from '../prisma';

export const bundleQueries = {
  findAll: async () => {
    return prisma.bundle.findMany({
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
      include: {
        bundleSubsites: {
          include: {
            subsite: true,
          },
        },
      },
    });
  },

  findAllActive: async () => {
    return prisma.bundle.findMany({
      where: { isActive: true },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
      include: {
        bundleSubsites: {
          include: {
            subsite: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                monthlyPrice: true,
                thumbnailStorageBucket: true,
                thumbnailStoragePath: true,
              },
            },
          },
        },
      },
    });
  },

  findById: async (id: string) => {
    return prisma.bundle.findUnique({
      where: { id },
      include: {
        bundleSubsites: {
          include: {
            subsite: true,
          },
        },
      },
    });
  },

  create: async (data: {
    name: string;
    description?: string | null;
    priceAmount?: number | null;
    originalPrice?: number | null;
    baseDevices?: number | null;
    extraDevicePrice?: number | null;
    maxTotalDevices?: number | null;
    withAdsDiscount?: number | null;
    discountPercent?: number | null;
    stripeProductId?: string;
    stripePriceId?: string;
    position?: number;
    isActive?: boolean;
    subsiteIds?: string[];
  }) => {
    const { subsiteIds, ...bundleData } = data;

    return prisma.bundle.create({
      data: {
        ...bundleData,
        bundleSubsites: subsiteIds?.length
          ? {
              create: subsiteIds.map((subsiteId) => ({
                subsiteId,
              })),
            }
          : undefined,
      },
      include: {
        bundleSubsites: {
          include: {
            subsite: true,
          },
        },
      },
    });
  },

  update: async (
    id: string,
    data: {
      name?: string;
      description?: string | null;
      priceAmount?: number | null;
      originalPrice?: number | null;
      baseDevices?: number | null;
      extraDevicePrice?: number | null;
      maxTotalDevices?: number | null;
      withAdsDiscount?: number | null;
      discountPercent?: number | null;
      stripeProductId?: string | null;
      stripePriceId?: string | null;
      position?: number;
      isActive?: boolean;
      subsiteIds?: string[];
    }
  ) => {
    const { subsiteIds, ...bundleData } = data;

    // If subsiteIds provided, replace all associations
    if (subsiteIds !== undefined) {
      await prisma.bundleSubsite.deleteMany({ where: { bundleId: id } });

      return prisma.bundle.update({
        where: { id },
        data: {
          ...bundleData,
          bundleSubsites: subsiteIds.length
            ? {
                create: subsiteIds.map((subsiteId) => ({
                  subsiteId,
                })),
              }
            : undefined,
        },
        include: {
          bundleSubsites: {
            include: {
              subsite: true,
            },
          },
        },
      });
    }

    return prisma.bundle.update({
      where: { id },
      data: bundleData,
      include: {
        bundleSubsites: {
          include: {
            subsite: true,
          },
        },
      },
    });
  },

  delete: async (id: string) => {
    return prisma.bundle.delete({
      where: { id },
    });
  },

  softDelete: async (id: string) => {
    return prisma.bundle.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
