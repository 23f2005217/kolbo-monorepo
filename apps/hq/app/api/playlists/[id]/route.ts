import { NextResponse } from 'next/server';
import { playlistQueries } from '@kolbo/database';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const playlist = await playlistQueries.findById(id);
    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist not found' },
        { status: 404 }
      );
    }

    const { enrichVideosWithThumbnails } = await import('@/utils/video-enrichment');
    const enrichedItems = await Promise.all(
      (playlist.items || []).map(async (item: any) => {
        if (item.video) {
          const enrichedVideo = await enrichVideosWithThumbnails([item.video]);
          return { ...item, video: enrichedVideo[0] };
        }
        return item;
      })
    );

    return NextResponse.json({ ...playlist, items: enrichedItems });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const playlist = await playlistQueries.update(id, body);
    return NextResponse.json(playlist);
  } catch (error) {
    console.error('Error updating playlist:', error);
    return NextResponse.json(
      { error: 'Failed to update playlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await playlistQueries.delete(id);
    return NextResponse.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return NextResponse.json(
      { error: 'Failed to delete playlist' },
      { status: 500 }
    );
  }
}
