import prisma from '../prisma';

export const playlistQueries = {
  findAll: async () => {
    return prisma.playlist.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        assignedAdmin: true,
        items: {
          include: {
            video: true,
          },
          orderBy: { position: 'asc' },
        },
        creators: { include: { creator: true } },
        offers: true,
        filterValues: { include: { filterValue: true } },
        categories: { include: { category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById: async (id: string) => {
    return prisma.playlist.findUnique({
      where: { id },
      include: {
        category: true,
        assignedAdmin: true,
        items: {
          include: {
            video: true,
          },
          orderBy: { position: 'asc' },
        },
        creators: { include: { creator: true } },
        offers: true,
        filterValues: { include: { filterValue: true } },
        categories: { include: { category: true } },
      },
    });
  },

  create: async (data: any) => {
    return prisma.playlist.create({
      data,
      include: { category: true },
    });
  },

  update: async (id: string, data: any) => {
    const { 
      items, 
      creators, 
      offers, 
      filterValues, 
      categories,
      ...rest 
    } = data;

    return prisma.$transaction(async (tx) => {
      // Update core playlist data
      const playlist = await tx.playlist.update({
        where: { id },
        data: rest,
      });

      // Update items (videos)
      if (items) {
        await tx.playlistItem.deleteMany({ where: { playlistId: id } });
        if (items.length > 0) {
          await tx.playlistItem.createMany({
            data: items.map((item: any) => ({
              playlistId: id,
              videoId: item.videoId,
              position: item.position,
              dripDays: item.dripDays || 0,
            })),
          });
        }
      }

      // Update creators (authors)
      if (creators) {
        await tx.playlistCreator.deleteMany({ where: { playlistId: id } });
        if (creators.length > 0) {
          await tx.playlistCreator.createMany({
            data: creators.map((creatorId: string) => ({
              playlistId: id,
              creatorId,
            })),
          });
        }
      }

      // Update offers (pricing)
      if (offers) {
        await tx.playlistOffer.deleteMany({ where: { playlistId: id } });
        if (offers.length > 0) {
          await tx.playlistOffer.createMany({
            data: offers.map((offer: any) => ({
              playlistId: id,
              ...offer,
            })),
          });
        }
      }

      // Update filter values
      if (filterValues) {
        await tx.playlistFilterValue.deleteMany({ where: { playlistId: id } });
        if (filterValues.length > 0) {
          await tx.playlistFilterValue.createMany({
            data: filterValues.map((filterValueId: string) => ({
              playlistId: id,
              filterValueId,
            })),
          });
        }
      }

      // Update categories
      if (categories) {
        await tx.playlistCategory.deleteMany({ where: { playlistId: id } });
        if (categories.length > 0) {
          await tx.playlistCategory.createMany({
            data: categories.map((categoryId: string, index: number) => ({
              playlistId: id,
              categoryId,
              position: index,
            })),
          });
        }
      }

      return playlist;
    });
  },

  delete: async (id: string) => {
    return prisma.playlist.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  addVideo: async (playlistId: string, videoId: string, position?: number) => {
    return prisma.playlistItem.create({
      data: {
        playlistId,
        videoId,
        position: position || 0,
      },
    });
  },

  removeVideo: async (playlistId: string, videoId: string) => {
    return prisma.playlistItem.deleteMany({
      where: { playlistId, videoId },
    });
  },
};
