import { NextResponse } from 'next/server';
import prisma from '@kolbo/database';

export async function GET() {
  try {
    const maorSubsite = await prisma.subsite.findFirst({ where: { slug: 'maor' } });
    if (!maorSubsite) {
      return NextResponse.json([]);
    }

    const tags = await prisma.searchTag.findMany({
      where: {
        videoTags: {
          some: {
            video: { subsiteId: maorSubsite.id },
          },
        },
      },
      include: {
        _count: {
          select: { videoTags: true },
        },
      },
      orderBy: { tag: 'asc' },
    });

    const mapped = tags.map(t => ({
      id: t.id,
      tag: t.tag,
      _count: { videos: t._count.videoTags },
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
