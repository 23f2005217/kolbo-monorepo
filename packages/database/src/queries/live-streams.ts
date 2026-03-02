import prisma from '../prisma';

export const liveStreamQueries = {
  findAll: async (options: { 
    search?: string, 
    status?: string, 
    sortBy?: string, 
    sortOrder?: 'asc' | 'desc' 
  } = {}) => {
    const { search, status, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const where: any = { 
      deletedAt: null,
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { shortDescription: { contains: search, mode: 'insensitive' } },
        ]
      })
    };

    return prisma.liveStream.findMany({
      where,
      include: {
        assignedAdmin: true,
        category: true,
      },
      orderBy: { [sortBy]: sortOrder },
    });
  },

  findById: async (id: string) => {
    return prisma.liveStream.findUnique({
      where: { id },
      include: {
        assignedAdmin: true,
        category: true,
      },
    });
  },

  create: async (data: any) => {
    return prisma.liveStream.create({
      data,
      include: { assignedAdmin: true, category: true },
    });
  },

  update: async (id: string, data: any) => {
    return prisma.liveStream.update({
      where: { id },
      data,
      include: { assignedAdmin: true, category: true },
    });
  },

  delete: async (id: string) => {
    return prisma.liveStream.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  deleteMany: async (ids: string[]) => {
    return prisma.liveStream.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    });
  },

  getActive: async () => {
    return prisma.liveStream.findMany({
      where: {
        status: 'published',
        deletedAt: null,
        scheduledStartAt: { lte: new Date() },
      },
      include: { assignedAdmin: true, category: true },
    });
  },

  getStats: async () => {
    const [total, live, scheduled] = await Promise.all([
      prisma.liveStream.count({ where: { deletedAt: null } }),
      prisma.liveStream.count({ 
        where: { 
          status: 'published', 
          deletedAt: null,
          scheduledStartAt: { lte: new Date() }
        } 
      }),
      prisma.liveStream.count({ 
        where: { 
          status: 'scheduled', 
          deletedAt: null 
        } 
      }),
    ]);
    return { total, live, scheduled };
  },

  getByMuxId: async (muxLiveStreamId: string) => {
    return prisma.liveStream.findFirst({
      where: { muxLiveStreamId },
    });
  },

  updateMuxStatus: async (muxLiveStreamId: string, status: string) => {
    return prisma.liveStream.updateMany({
      where: { muxLiveStreamId },
      data: { 
        status: status === 'active' ? 'published' : 'unpublished',
        updatedAt: new Date(),
      },
    });
  },
};
