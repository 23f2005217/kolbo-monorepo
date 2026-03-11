import prisma from '../prisma';

export const subscriptionPlanQueries = {
  findAll: async () => {
    return prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    });
  },

  findAllForAdmin: async () => {
    return prisma.subscriptionPlan.findMany({
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    });
  },

  findById: async (id: string) => {
    return prisma.subscriptionPlan.findUnique({
      where: { id },
    });
  },

  findByType: async (planType: string) => {
    return prisma.subscriptionPlan.findMany({
      where: { planType, isActive: true },
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
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
