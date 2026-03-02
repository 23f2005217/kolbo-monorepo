import prisma from '../prisma';

export const adInventoryQueries = {
  findAll: async (options?: { availableOnly?: boolean }) => {
    const where: any = {};
    if (options?.availableOnly) where.isAvailable = true;

    return prisma.adInventory.findMany({
      where,
      include: {
        subsite: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { subsite: { name: 'asc' } },
    });
  },

  findById: async (id: string) => {
    return prisma.adInventory.findUnique({
      where: { id },
      include: {
        subsite: { select: { id: true, name: true, slug: true } },
      },
    });
  },

  findBySubsiteId: async (subsiteId: string) => {
    return prisma.adInventory.findUnique({
      where: { subsiteId },
      include: {
        subsite: { select: { id: true, name: true, slug: true } },
      },
    });
  },

  create: async (data: { subsiteId: string; isAvailable?: boolean; cpmCents?: number }) => {
    return prisma.adInventory.create({
      data: {
        subsiteId: data.subsiteId,
        isAvailable: data.isAvailable ?? true,
        cpmCents: data.cpmCents ?? 500,
      },
      include: {
        subsite: { select: { id: true, name: true, slug: true } },
      },
    });
  },

  update: async (id: string, data: Partial<{ isAvailable: boolean; cpmCents: number }>) => {
    return prisma.adInventory.update({
      where: { id },
      data,
      include: {
        subsite: { select: { id: true, name: true, slug: true } },
      },
    });
  },

  getAvailableChannels: async () => {
    const inventory = await prisma.adInventory.findMany({
      where: { isAvailable: true },
      include: {
        subsite: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { subsite: { name: 'asc' } },
    });

    return inventory.map((item) => ({
      id: item.subsite.id,
      name: item.subsite.name,
      slug: item.subsite.slug,
      cpm: item.cpmCents / 100,
    }));
  },
};
