import { NextResponse } from 'next/server';
import prisma from '@kolbo/database';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;

    // Get the original video with all related data
    const originalVideo = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        offers: true,
        creators: true,
        bundles: true,
        filterValues: true,
        searchTags: true,
        images: true,
        geoBlocks: true,
        adMarkers: true,
        subtitles: true,
      },
    });

    if (!originalVideo) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Create a new video with the same data
    const duplicatedVideo = await prisma.video.create({
      data: {
        title: `${originalVideo.title} (Copy)`,
        descriptionRich: originalVideo.descriptionRich,
        shortDescription: originalVideo.shortDescription,
        status: 'unpublished', // Always set as unpublished
        slug: `${originalVideo.slug}-copy-${Date.now()}`,
        isFree: originalVideo.isFree,
        hasAds: originalVideo.hasAds,
        adsMode: originalVideo.adsMode,
        adsPlacement: originalVideo.adsPlacement,
        midRollIntervalMinutes: originalVideo.midRollIntervalMinutes,
        categoryId: originalVideo.categoryId,
        subsiteId: originalVideo.subsiteId,
        seoTitle: originalVideo.seoTitle,
        seoDescription: originalVideo.seoDescription,
        seoKeywords: originalVideo.seoKeywords,
        trailerVideoId: originalVideo.trailerVideoId,
        trailerForceFree: originalVideo.trailerForceFree,
        assignedAdminId: originalVideo.assignedAdminId,
        createdBy: originalVideo.createdBy,
        // Copy offers
        offers: originalVideo.offers.length > 0 ? {
          create: originalVideo.offers.map(offer => ({
            offerType: offer.offerType,
            amountCents: offer.amountCents,
            currency: offer.currency,
            rentalDurationDays: offer.rentalDurationDays,
            maxSimultaneousStreams: offer.maxSimultaneousStreams,
            isActive: offer.isActive,
          })),
        } : undefined,
        // Copy creators
        creators: originalVideo.creators.length > 0 ? {
          create: originalVideo.creators.map(creator => ({
            creatorId: creator.creatorId,
            revenueShareBps: creator.revenueShareBps,
          })),
        } : undefined,
        // Copy filter values
        filterValues: originalVideo.filterValues.length > 0 ? {
          create: originalVideo.filterValues.map(fv => ({
            filterValueId: fv.filterValueId,
          })),
        } : undefined,
        // Copy search tags
        searchTags: originalVideo.searchTags.length > 0 ? {
          create: originalVideo.searchTags.map(st => ({
            searchTagId: st.searchTagId,
          })),
        } : undefined,
        // Copy images
        images: originalVideo.images.length > 0 ? {
          create: originalVideo.images.map(img => ({
            imageType: img.imageType,
            storageBucket: img.storageBucket,
            storagePath: img.storagePath,
          })),
        } : undefined,
        // Copy geo blocks
        geoBlocks: originalVideo.geoBlocks.length > 0 ? {
          create: originalVideo.geoBlocks.map(gb => ({
            countryCode: gb.countryCode,
          })),
        } : undefined,
        // Copy ad markers
        adMarkers: originalVideo.adMarkers.length > 0 ? {
          create: originalVideo.adMarkers.map(am => ({
            timestampSeconds: am.timestampSeconds,
          })),
        } : undefined,
        // Copy subtitles
        subtitles: originalVideo.subtitles.length > 0 ? {
          create: originalVideo.subtitles.map(s => ({
            languageCode: s.languageCode,
            storageBucket: s.storageBucket,
            storagePath: s.storagePath,
            label: s.label,
            isDefault: s.isDefault,
          })),
        } : undefined,
        // Copy bundles
        bundles: originalVideo.bundles.length > 0 ? {
          create: originalVideo.bundles.map(b => ({
            bundleId: b.bundleId,
          })),
        } : undefined,
      },
    });

    return NextResponse.json({
      id: duplicatedVideo.id,
      message: 'Video duplicated successfully',
    });
  } catch (error) {
    console.error('Error duplicating video:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate video' },
      { status: 500 }
    );
  }
}
