import { prisma } from '@kolbo/database';

export async function GET() {
  try {
    const playlists = await prisma.playlist.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        assignedAdmin: true,
        creators: { include: { creator: true } },
        _count: {
          select: { items: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const { enrichPlaylistThumbnail } = await import('@/utils/video-enrichment');
    const enriched = await Promise.all(
      playlists.map(async (p: any) => {
        const enriched = await enrichPlaylistThumbnail(p);
        return { 
          ...enriched, 
          itemCount: p._count.items 
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlists' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const playlist = await playlistQueries.create(body);
    return NextResponse.json(playlist, { status: 201 });
  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    );
  }
}
