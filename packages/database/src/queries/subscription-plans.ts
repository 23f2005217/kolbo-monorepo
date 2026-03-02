import prisma from '../prisma';

export const subscriptionPlanQueries = {
  findAll: async () => {
    return prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById: async (id: string) => {
    return prisma.subscriptionPlan.findUnique({
      where: { id },
    });
  },

  create: async (data: any) => {
    return prisma.subscriptionPlan.create({ data });
  },

  update: async (id: string, data: any) => {
    return prisma.subscriptionPlan.update({
      where: { id },
      data,
    });
  },

  delete: async (id: string) => {
    return prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
