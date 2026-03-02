import prisma from '../prisma';

export const categoryQueries = {
  findAll: async () => {
    return prisma.category.findMany({
      orderBy: { position: 'asc' },
    });
  },

  findById: async (id: string) => {
    return prisma.category.findUnique({
      where: { id },
    });
  },

  create: async (data: any) => {
    return prisma.category.create({ data });
  },

  update: async (id: string, data: any) => {
    return prisma.category.update({
      where: { id },
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
