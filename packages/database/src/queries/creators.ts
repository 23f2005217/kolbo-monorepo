import prisma from '../prisma';

export const creatorQueries = {
  findAll: async () => {
    return prisma.creator.findMany({
      where: { isActive: true },
      include: {
        videoCreators: {
          include: { video: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById: async (id: string) => {
    return prisma.creator.findUnique({
      where: { id },
      include: {
        videoCreators: {
          include: { video: true },
        },
      },
    });
  },

  create: async (data: any) => {
    return prisma.creator.create({ data });
  },

  update: async (id: string, data: any) => {
    return prisma.creator.update({
      where: { id },
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.creator.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
