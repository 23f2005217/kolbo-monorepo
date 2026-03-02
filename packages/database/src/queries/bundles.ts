import prisma from '../prisma';

export const bundleQueries = {
  findAll: async () => {
    return prisma.bundle.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  create: async (data: any) => {
    return prisma.bundle.create({
      data,
    });
  },
};
