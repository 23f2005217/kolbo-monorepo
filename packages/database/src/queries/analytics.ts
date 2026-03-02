import prisma from '../prisma';

export const analyticsQueries = {
  getVideoStats: async () => {
    const [totalVideos, publishedVideos, totalDuration] = await Promise.all([
      prisma.video.count({ where: { deletedAt: null } }),
      prisma.video.count({ where: { status: 'published', deletedAt: null } }),
      prisma.videoAsset.aggregate({
        where: { status: 'ready' },
        _sum: { durationSeconds: true },
      }),
    ]);

    return {
      totalVideos,
      publishedVideos,
      totalDuration: totalDuration._sum.durationSeconds || 0,
    };
  },

  getRecentVideos: async (limit: number = 5) => {
    return prisma.video.findMany({
      where: { deletedAt: null },
      include: {
        assets: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  getPlaylistStats: async () => {
    const [totalPlaylists, totalItems] = await Promise.all([
      prisma.playlist.count({ where: { deletedAt: null } }),
      prisma.playlistItem.count(),
    ]);

    return { totalPlaylists, totalItems };
  },
};
