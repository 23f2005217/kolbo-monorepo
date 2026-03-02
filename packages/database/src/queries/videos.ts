import prisma from '../prisma';
import { mux } from '@kolbo/mux-client';

export const videoQueries = {
  findAll: async (options?: { status?: string; limit?: number; offset?: number; search?: string; subsiteSlug?: string }) => {
    const where: any = { deletedAt: null };
    if (options?.status) where.status = options.status;
    if (options?.search) {
      where.title = { contains: options.search, mode: 'insensitive' };
    }
    if (options?.subsiteSlug) {
      where.subsite = { slug: options.subsiteSlug, isActive: true };
    }
    
    return prisma.video.findMany({
      where,
      include: {
        assets: true,
        category: true,
        assignedAdmin: true,
        subsite: true,
        creators: { include: { creator: true } },
        images: true,
        searchTags: { include: { searchTag: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    });
  },

  findById: async (id: string) => {
    return prisma.video.findUnique({
      where: { id },
      include: {
        assets: true,
        category: true,
        assignedAdmin: true,
        subsite: true,
        creators: { include: { creator: true } },
        offers: true,
        images: true,
        searchTags: { include: { searchTag: true } },
        geoBlocks: true,
        bundles: { include: { bundle: true } },
        filterValues: { include: { filterValue: true } },
        subscriptionPlans: { include: { subscriptionPlan: true } },
      },
    });
  },

  create: async (data: any) => {
    // Generate slug if not provided
    if (!data.slug) {
      const slugBase = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      data.slug = `${slugBase}-${Date.now()}`;
    }

    return prisma.video.create({
      data,
      include: { assets: true, category: true },
    });
  },

  update: async (id: string, data: any) => {
    const { offers, bundles, images, searchTags, creators, filterValueIds, subscriptionPlanIds, geoBlocks, ...videoData } = data;

    // Prepare main video data
    const updateData: any = {
      ...videoData,
    };

    // Ensure numeric fields are correctly typed
    if (videoData.minimumAge !== undefined) {
      updateData.minimumAge = parseInt(videoData.minimumAge.toString()) || 0;
    }
    if (videoData.maxSimultaneousStreams !== undefined) {
      updateData.maxSimultaneousStreams = parseInt(videoData.maxSimultaneousStreams.toString()) || 0;
    }
    if (videoData.midRollIntervalMinutes !== undefined) {
      updateData.midRollIntervalMinutes = parseInt(videoData.midRollIntervalMinutes.toString()) || 10;
    }

    // Map relational ID fields to connect/disconnect syntax
    if (videoData.categoryId !== undefined) {
      updateData.category = videoData.categoryId ? { connect: { id: videoData.categoryId } } : { disconnect: true };
      delete updateData.categoryId;
    }
    if (videoData.subsiteId !== undefined) {
      updateData.subsite = videoData.subsiteId ? { connect: { id: videoData.subsiteId } } : { disconnect: true };
      delete updateData.subsiteId;
    }
    if (videoData.assignedAdminId !== undefined) {
      updateData.assignedAdmin = videoData.assignedAdminId ? { connect: { id: videoData.assignedAdminId } } : { disconnect: true };
      delete updateData.assignedAdminId;
    }

    // Convert ISO strings to Date objects for Prisma
    if (updateData.publishScheduledAt && typeof updateData.publishScheduledAt === 'string' && updateData.publishScheduledAt.trim() !== '') {
      updateData.publishScheduledAt = new Date(updateData.publishScheduledAt);
    } else if (updateData.publishScheduledAt === '') {
      updateData.publishScheduledAt = null;
    }

    try {
      return await prisma.$transaction(async (tx) => {
        await tx.video.update({
          where: { id },
          data: updateData,
        });

        if (geoBlocks !== undefined) {
          await tx.videoGeoBlock.deleteMany({
            where: { videoId: id },
          });

          if (geoBlocks.length > 0) {
            await tx.videoGeoBlock.createMany({
              data: geoBlocks.map((countryCode: string) => ({
                videoId: id,
                countryCode: countryCode.toUpperCase(),
              })),
            });
          }
        }

        if (offers !== undefined) {
          await tx.videoOffer.deleteMany({
            where: { videoId: id },
          });

          if (offers.length > 0) {
            const offersToCreate = offers.map((offer: any) => ({
              videoId: id,
              offerType: offer.offerType,
              amountCents: parseInt(offer.amountCents.toString()),
              pricePerDeviceCents: offer.pricePerDeviceCents ? parseInt(offer.pricePerDeviceCents.toString()) : 0,
              rentalDurationDays: offer.rentalDurationDays ? parseInt(offer.rentalDurationDays.toString()) : null,
              maxSimultaneousStreams: offer.maxSimultaneousStreams ? parseInt(offer.maxSimultaneousStreams.toString()) : null,
              tierLabel: offer.tierLabel || null,
              currency: offer.currency || 'usd',
            }));
            
            await tx.videoOffer.createMany({ data: offersToCreate });
          }
        }

        if (bundles !== undefined) {
          await tx.bundleVideo.deleteMany({ where: { videoId: id } });
          if (bundles.length > 0) {
            await tx.bundleVideo.createMany({
              data: bundles.map((bundleId: string) => ({ videoId: id, bundleId })),
            });
          }
        }

        if (images !== undefined) {
          await tx.videoImage.deleteMany({ where: { videoId: id } });
          if (images.length > 0) {
            await tx.videoImage.createMany({
              data: images.map((image: any) => ({
                videoId: id,
                imageType: image.imageType,
                storageBucket: image.storageBucket,
                storagePath: image.storagePath,
              })),
            });
          }
        }

        if (searchTags !== undefined) {
          await tx.videoSearchTag.deleteMany({ where: { videoId: id } });
          for (const tag of searchTags) {
            let searchTag = await tx.searchTag.findUnique({ where: { tag: tag.toLowerCase() } });
            if (!searchTag) {
              searchTag = await tx.searchTag.create({ data: { tag: tag.toLowerCase() } });
            }
            await tx.videoSearchTag.create({ data: { videoId: id, searchTagId: searchTag.id } });
            await tx.searchTag.update({ where: { id: searchTag.id }, data: { usageCount: { increment: 1 } } });
          }
        }

        if (creators !== undefined) {
          await tx.videoCreator.deleteMany({ where: { videoId: id } });
          if (creators.length > 0) {
            await tx.videoCreator.createMany({
              data: creators.map((creatorId: string) => ({ videoId: id, creatorId, revenueShareBps: 0 })),
            });
          }
        }

        if (filterValueIds !== undefined) {
          await tx.videoFilterValue.deleteMany({ where: { videoId: id } });
          if (filterValueIds.length > 0) {
            await tx.videoFilterValue.createMany({
              data: filterValueIds.map((filterValueId: string) => ({ videoId: id, filterValueId })),
            });
          }
        }

        if (subscriptionPlanIds !== undefined) {
          await tx.videoSubscriptionPlan.deleteMany({ where: { videoId: id } });
          if (subscriptionPlanIds.length > 0) {
            await tx.videoSubscriptionPlan.createMany({
              data: subscriptionPlanIds.map((subscriptionPlanId: string) => ({ videoId: id, subscriptionPlanId })),
            });
          }
        }

        return await tx.video.findUnique({
          where: { id },
          include: {
            assets: true,
            category: true,
            subsite: true,
            creators: { include: { creator: true } },
            offers: true,
            images: true,
            searchTags: { include: { searchTag: true } },
            geoBlocks: true,
            bundles: { include: { bundle: true } },
            filterValues: { include: { filterValue: true } },
            subscriptionPlans: { include: { subscriptionPlan: true } },
          },
        });
      }, { timeout: 20000 });
    } catch (err: any) {
      console.error(`[videoQueries.update] TRANSACTION ERROR updating video ${id}:`, err);
      if (err.code) console.error(`[videoQueries.update] Prisma Error Code: ${err.code}`);
      if (err.meta) console.error(`[videoQueries.update] Prisma Error Meta:`, err.meta);
      throw err;
    }
  },

  delete: async (id: string) => {
    // Get all video assets to delete from Mux
    const assets = await prisma.videoAsset.findMany({
      where: { videoId: id },
    });

    // Delete assets from Mux
    for (const asset of assets) {
      try {
        await mux.video.assets.delete(asset.muxAssetId);
      } catch (err) {
        // Log error but continue - asset might already be deleted or not exist
        console.error(`Failed to delete Mux asset ${asset.muxAssetId}:`, err);
      }
    }

    // Soft delete the video
    return prisma.video.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  deleteMany: async (ids: string[]) => {
    // Get all video assets to delete from Mux
    const assets = await prisma.videoAsset.findMany({
      where: { videoId: { in: ids } },
    });

    // Delete assets from Mux
    for (const asset of assets) {
      try {
        await mux.video.assets.delete(asset.muxAssetId);
      } catch (err) {
        // Log error but continue - asset might already be deleted or not exist
        console.error(`Failed to delete Mux asset ${asset.muxAssetId}:`, err);
      }
    }

    // Soft delete the videos
    return prisma.video.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    });
  },

  getStats: async () => {
    const [total, published, unpublished] = await Promise.all([
      prisma.video.count({ where: { deletedAt: null } }),
      prisma.video.count({ where: { status: 'published', deletedAt: null } }),
      prisma.video.count({ where: { status: 'unpublished', deletedAt: null } }),
    ]);
    return { total, published, unpublished };
  },
};
