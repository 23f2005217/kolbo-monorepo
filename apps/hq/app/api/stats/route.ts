import { NextResponse } from 'next/server';
import { videoQueries, liveStreamQueries, playlistQueries, analyticsQueries } from '@kolbo/database';

export async function GET() {
  try {
    const [videoStats, liveStats, playlistStats, recentVideos] = await Promise.all([
      videoQueries.getStats(),
      liveStreamQueries.getStats(),
      playlistQueries.findAll().then(p => ({ total: p.length })),
      analyticsQueries.getRecentVideos(5),
    ]);

    return NextResponse.json({
      videos: videoStats,
      liveStreams: liveStats,
      playlists: playlistStats,
      recentVideos,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
