import prisma from '../prisma';

export const subsiteQueries = {
  findAll: async () => {
    return prisma.subsite.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  },

  /** All subsites including inactive (for admin management) */
  findAllForAdmin: async () => {
    return prisma.subsite.findMany({
      orderBy: { name: 'asc' },
    });
  },

  findById: async (id: string) => {
    return prisma.subsite.findUnique({
      where: { id },
    });
  },

  findBySlug: async (slug: string) => {
    return prisma.subsite.findUnique({
      where: { slug },
      include: {
        videos: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          where: { 
            status: 'published'
          },
          select: {
            assets: {
              select: { muxPlaybackId: true, muxPublicPlaybackId: true, isPrimary: true }
            },
            images: {
              select: { storageBucket: true, storagePath: true, imageType: true }
            }
          }
        }
      }
    });
  },

  create: async (data: {
    name: string;
    slug: string;
    description?: string;
    isActive?: boolean;
    thumbnailStorageBucket?: string;
    thumbnailStoragePath?: string;
    monthlyPrice?: number | null;
    fiveDevicesAddonPrice?: number | null;
    withAdsDiscount?: number | null;
  }) => {
    return prisma.subsite.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        isActive: data.isActive ?? true,
        thumbnailStorageBucket: data.thumbnailStorageBucket,
        thumbnailStoragePath: data.thumbnailStoragePath,
        monthlyPrice: data.monthlyPrice ?? null,
        fiveDevicesAddonPrice: data.fiveDevicesAddonPrice ?? 0,
        withAdsDiscount: data.withAdsDiscount ?? 0,
      },
    });
  },

  update: async (
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string | null;
      isActive?: boolean;
      thumbnailStorageBucket?: string | null;
      thumbnailStoragePath?: string | null;
      monthlyPrice?: number | null;
      fiveDevicesAddonPrice?: number | null;
      withAdsDiscount?: number | null;
    }
  ) => {
    return prisma.subsite.update({
      where: { id },
      data,
    });
  },

  /** Soft delete: set isActive to false */
  delete: async (id: string) => {
    return prisma.subsite.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
