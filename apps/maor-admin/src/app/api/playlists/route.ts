import { NextResponse } from 'next/server';
import prisma from '@kolbo/database';

export async function GET() {
  try {
    const maorSubsite = await prisma.subsite.findFirst({ where: { slug: 'maor' } });
    if (!maorSubsite) {
      return NextResponse.json([]);
    }

    const maorVideoIds = new Set(
      (await prisma.video.findMany({
        where: { subsiteId: maorSubsite.id },
        select: { id: true },
      })).map(v => v.id)
    );

    const playlists = await prisma.playlist.findMany({
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

    const filtered = playlists.filter(p =>
      p.items.some(item => maorVideoIds.has(item.videoId))
    );

    return NextResponse.json(filtered);
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
    const playlist = await prisma.playlist.create({
      data: body,
      include: { category: true },
    });
    return NextResponse.json(playlist, { status: 201 });
  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    );
  }
}
