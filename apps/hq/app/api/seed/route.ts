import { NextResponse } from 'next/server';
import prisma from '@kolbo/database';

export async function POST() {
  try {
    // Create creators
    const creators = await Promise.all([
      prisma.creator.create({
        data: {
          displayName: 'Moshe Klein',
          bio: 'Expert in creative workflows',
          payoutProfile: { paypal: 'moshe@example.com' },
        },
      }),
      prisma.creator.create({
        data: {
          displayName: 'Sarah Levy',
          bio: 'Content creation specialist',
          payoutProfile: { stripe: 'acct_123' },
        },
      }),
      prisma.creator.create({
        data: {
          displayName: 'David Cohen',
          bio: 'Video production expert',
          payoutProfile: { paypal: 'david@example.com' },
        },
      }),
    ]);

    // Create categories
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Torah Learning',
          type: 'video_row',
          description: 'Weekly Torah lessons and insights',
        },
      }),
      prisma.category.create({
        data: {
          name: 'Q&A Sessions',
          type: 'video_row',
          description: 'Interactive Q&A with experts',
        },
      }),
      prisma.category.create({
        data: {
          name: 'Special Events',
          type: 'video_row',
          description: 'Special programs and events',
        },
      }),
    ]);

    // Create videos with assets
    const videos: any[] = [];
    
    const video1 = await prisma.video.create({
      data: {
        title: 'The 20-Min Creator Workflow',
        descriptionRich: 'Learn the essential workflow for content creators in just 20 minutes.',
        shortDescription: 'Master creator workflow essentials',
        slug: '20-min-creator-workflow',
        status: 'published',
        publishedAt: new Date('2024-12-01'),
        categoryId: categories[0].id,
      },
    });
    videos.push(video1);
    
    await prisma.videoAsset.create({
      data: {
        videoId: video1.id,
        muxAssetId: 'asset-001',
        muxPlaybackId: 'playback-001',
        durationSeconds: 1200,
        status: 'ready',
        isPrimary: true,
      },
    });
    
    await prisma.videoCreator.create({
      data: {
        videoId: video1.id,
        creatorId: creators[0].id,
        revenueShareBps: 7000,
      },
    });
    
    const video2 = await prisma.video.create({
      data: {
        title: 'Advanced Video Editing Techniques',
        descriptionRich: 'Professional editing tips and tricks for creators.',
        shortDescription: 'Pro editing techniques',
        slug: 'advanced-editing-techniques',
        status: 'published',
        publishedAt: new Date('2024-12-05'),
        categoryId: categories[0].id,
      },
    });
    videos.push(video2);
    
    await prisma.videoAsset.create({
      data: {
        videoId: video2.id,
        muxAssetId: 'asset-002',
        muxPlaybackId: 'playback-002',
        durationSeconds: 1800,
        status: 'ready',
        isPrimary: true,
      },
    });
    
    await prisma.videoCreator.create({
      data: {
        videoId: video2.id,
        creatorId: creators[1].id,
        revenueShareBps: 6500,
      },
    });
    
    const video3 = await prisma.video.create({
      data: {
        title: 'Building Your Brand Online',
        descriptionRich: 'Strategies for building a strong personal brand.',
        shortDescription: 'Brand building strategies',
        slug: 'building-your-brand',
        status: 'published',
        publishedAt: new Date('2024-12-10'),
        categoryId: categories[1].id,
      },
    });
    videos.push(video3);
    
    await prisma.videoAsset.create({
      data: {
        videoId: video3.id,
        muxAssetId: 'asset-003',
        muxPlaybackId: 'playback-003',
        durationSeconds: 2400,
        status: 'ready',
        isPrimary: true,
      },
    });
    
    await prisma.videoCreator.create({
      data: {
        videoId: video3.id,
        creatorId: creators[2].id,
        revenueShareBps: 8000,
      },
    });
    
    const video4 = await prisma.video.create({
      data: {
        title: 'Live Streaming Best Practices',
        descriptionRich: 'Tips for successful live streaming.',
        shortDescription: 'Live streaming guide',
        slug: 'live-streaming-guide',
        status: 'unpublished',
        categoryId: categories[2].id,
      },
    });
    videos.push(video4);
    
    await prisma.videoAsset.create({
      data: {
        videoId: video4.id,
        muxAssetId: 'asset-004',
        muxUploadId: 'upload-004',
        status: 'preparing',
        isPrimary: true,
      },
    });
    
    const video5 = await prisma.video.create({
      data: {
        title: 'Content Calendar Planning',
        descriptionRich: 'How to plan your content calendar effectively.',
        shortDescription: 'Calendar planning tips',
        slug: 'content-calendar',
        status: 'scheduled',
        publishScheduledAt: new Date('2025-02-15'),
        categoryId: categories[0].id,
      },
    });
    videos.push(video5);
    
    await prisma.videoAsset.create({
      data: {
        videoId: video5.id,
        muxAssetId: 'asset-005',
        muxPlaybackId: 'playback-005',
        durationSeconds: 1500,
        status: 'ready',
        isPrimary: true,
      },
    });

    // Create playlists
    const playlists = await Promise.all([
      prisma.playlist.create({
        data: {
          title: 'Creator Essentials',
          descriptionRich: 'Essential videos for content creators',
          shortDescription: 'Must-watch creator content',
          status: 'published',
          categoryId: categories[0].id,
          items: {
            create: [
              { videoId: videos[0].id, position: 0 },
              { videoId: videos[1].id, position: 1 },
            ],
          },
        },
      }),
      prisma.playlist.create({
        data: {
          title: 'Advanced Techniques',
          descriptionRich: 'Advanced content creation techniques',
          shortDescription: 'Level up your skills',
          status: 'published',
          categoryId: categories[1].id,
          items: {
            create: [
              { videoId: videos[2].id, position: 0 },
            ],
          },
        },
      }),
      prisma.playlist.create({
        data: {
          title: 'Live Sessions Archive',
          descriptionRich: 'Recordings of past live sessions',
          shortDescription: 'Past live streams',
          status: 'published',
          categoryId: categories[2].id,
        },
      }),
      prisma.playlist.create({
        data: {
          title: 'Upcoming Content',
          descriptionRich: 'Preview of upcoming videos',
          shortDescription: 'Coming soon',
          status: 'unpublished',
        },
      }),
    ]);

    // Create live streams
    const liveStreams = await Promise.all([
      prisma.liveStream.create({
        data: {
          title: 'Weekly Torah Live',
          descriptionRich: 'Join us for our weekly Torah discussion',
          shortDescription: 'Weekly Torah session',
          status: 'published',
          scheduledStartAt: new Date(),
          sourceType: 'mux_rtmp',
          muxLiveStreamId: 'live-001',
          muxStreamKey: 'stream-key-001',
          muxPlaybackId: 'playback-live-001',
          chatEnabled: true,
        },
      }),
      prisma.liveStream.create({
        data: {
          title: 'Q&A Session',
          descriptionRich: 'Live Q&A with our experts',
          shortDescription: 'Interactive Q&A',
          status: 'scheduled',
          scheduledStartAt: new Date(Date.now() + 86400000),
          sourceType: 'browser',
          chatEnabled: true,
          remindersEnabled: true,
        },
      }),
      prisma.liveStream.create({
        data: {
          title: 'Special Event: Holiday Special',
          descriptionRich: 'Special holiday programming',
          shortDescription: 'Holiday special',
          status: 'scheduled',
          scheduledStartAt: new Date(Date.now() + 172800000),
          sourceType: 'zoom',
          zoomUrl: 'https://zoom.us/j/123456789',
          chatEnabled: true,
        },
      }),
      prisma.liveStream.create({
        data: {
          title: 'Past Live: Creator Workshop',
          descriptionRich: 'Recording of our creator workshop',
          shortDescription: 'Workshop recording',
          status: 'archived',
          scheduledStartAt: new Date('2024-11-15'),
          sourceType: 'mux_rtmp',
          muxPlaybackId: 'playback-past-001',
        },
      }),
    ]);

    // Create subscription plans
    const subscriptionPlans = await Promise.all([
      prisma.subscriptionPlan.create({
        data: {
          name: 'Premium Plan',
          description: 'Full access to all content',
          isActive: true,
        },
      }),
      prisma.subscriptionPlan.create({
        data: {
          name: 'Basic Plan',
          description: 'Access to basic content',
          isActive: true,
        },
      }),
      prisma.subscriptionPlan.create({
        data: {
          name: 'Enterprise Plan',
          description: 'For teams and organizations',
          isActive: true,
        },
      }),
    ]);

    return NextResponse.json({
      message: 'Database seeded successfully',
      counts: {
        creators: creators.length,
        categories: categories.length,
        videos: videos.length,
        playlists: playlists.length,
        liveStreams: liveStreams.length,
        subscriptionPlans: subscriptionPlans.length,
      },
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Delete in order to respect foreign keys
    await prisma.playlistItem.deleteMany({});
    await prisma.playlist.deleteMany({});
    await prisma.videoCreator.deleteMany({});
    await prisma.videoAsset.deleteMany({});
    await prisma.video.deleteMany({});
    await prisma.liveStream.deleteMany({});
    await prisma.subscriptionPlan.deleteMany({});
    await prisma.creator.deleteMany({});
    await prisma.category.deleteMany({});

    return NextResponse.json({ message: 'Database cleared successfully' });
  } catch (error) {
    console.error('Error clearing database:', error);
    return NextResponse.json(
      { error: 'Failed to clear database' },
      { status: 500 }
    );
  }
}
