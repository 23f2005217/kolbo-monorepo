import prisma from '../prisma';

export const filterQueries = {
  findAll: async () => {
    return prisma.filter.findMany({
      include: {
        filterValues: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { position: 'asc' },
    });
  },

  findById: async (id: string) => {
    return prisma.filter.findUnique({
      where: { id },
      include: {
        filterValues: {
          orderBy: { position: 'asc' },
        },
      },
    });
  },

  create: async (data: any) => {
    const { filterValues, ...filterData } = data;
    
    if (!filterData.slug) {
      filterData.slug = filterData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    return prisma.filter.create({
      data: {
        ...filterData,
        filterValues: filterValues ? {
          create: filterValues.map((v: any, index: number) => ({
            ...v,
            position: v.position ?? index,
          })),
        } : undefined,
      },
      include: { filterValues: true },
    });
  },

  update: async (id: string, data: any) => {
    const { filterValues, ...filterData } = data;

    // Update main filter
    const updatedFilter = await prisma.filter.update({
      where: { id },
      data: filterData,
      include: { filterValues: true },
    });

    // If filterValues provided, it's a bit complex. 
    // Usually for simple sync we delete and recreate or perform individual updates.
    // For now, let's just handle filterData.
    
    return updatedFilter;
  },

  delete: async (id: string) => {
    return prisma.filter.delete({
      where: { id },
    });
  },

  // Filter Values
  addValue: async (filterId: string, data: any) => {
    return prisma.filterValue.create({
      data: {
        ...data,
        filterId,
      },
    });
  },

  updateValue: async (id: string, data: any) => {
    return prisma.filterValue.update({
      where: { id },
      data,
    });
  },

  deleteValue: async (id: string) => {
    return prisma.filterValue.delete({
      where: { id },
    });
  },
};
