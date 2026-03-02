import prisma from '../prisma';

export const userQueries = {
  findAll: async () => {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  findById: async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  findByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  create: async (data: { email: string; name?: string }) => {
    return prisma.user.create({
      data,
    });
  },

  update: async (id: string, data: any) => {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.user.delete({
      where: { id },
    });
  },
};
