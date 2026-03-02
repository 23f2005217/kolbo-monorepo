import { NextRequest, NextResponse } from 'next/server';
import { getSession, ADMIN_SESSION_COOKIE_NAME } from '@kolbo/auth';
import prisma from '@kolbo/database';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sessionData = await getSession(token);

    if (!sessionData || sessionData.sessionType !== 'admin') {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const slotType = searchParams.get('slotType');
    const subsiteId = searchParams.get('subsiteId');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where: any = {};

    if (search) {
      where.OR = [
        { slotId: { contains: search, mode: 'insensitive' } },
        { slotType: { contains: search, mode: 'insensitive' } },
        { subsite: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (slotType) {
      where.slotType = slotType;
    }

    if (subsiteId) {
      where.subsiteId = subsiteId;
    }

    const inventory = await prisma.adInventory.findMany({
      where,
      include: {
        subsite: {
          select: {
            name: true,
            slug: true,
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
    });

    return NextResponse.json(inventory);
  } catch (err) {
    console.error('HQ Get inventory error:', err);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}
