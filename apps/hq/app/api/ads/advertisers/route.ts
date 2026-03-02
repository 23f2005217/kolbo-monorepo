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
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where: any = {};

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const advertisers = await prisma.advertiserAccount.findMany({
      where,
      include: {
        _count: {
          select: { campaigns: true }
        },
        campaigns: {
          include: {
            analytics: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
    });

    const mappedAdvertisers = advertisers.map((adv: any) => {
      const totalSpendCents = adv.campaigns.reduce((acc: number, camp: any) => {
        return acc + camp.analytics.reduce((sum: number, a: any) => sum + a.spend, 0);
      }, 0);

      return {
        id: adv.id,
        companyName: adv.companyName,
        contactName: adv.contactName,
        email: adv.email,
        status: adv.status,
        campaignsCount: adv._count.campaigns,
        totalSpend: `$${(totalSpendCents / 100).toLocaleString()}`,
        createdAt: adv.createdAt,
      };
    });

    return NextResponse.json(mappedAdvertisers);
  } catch (err) {
    console.error('HQ Get advertisers error:', err);
    return NextResponse.json({ error: 'Failed to fetch advertisers' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sessionData = await getSession(token);

    if (!sessionData || sessionData.sessionType !== 'admin') {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'IDs array required' }, { status: 400 });
    }

    // Note: In a real app, you might want to handle cascading deletes or prevent deletion if active campaigns exist
    await prisma.advertiserAccount.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('HQ Delete advertisers error:', err);
    return NextResponse.json({ error: 'Failed to delete advertisers' }, { status: 500 });
  }
}
