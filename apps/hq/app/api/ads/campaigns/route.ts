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
        { name: { contains: search, mode: 'insensitive' } },
        { advertiser: { companyName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const campaigns = await prisma.adCampaign.findMany({
      where,
      include: {
        advertiser: { select: { companyName: true } },
        analytics: true,
      },
      orderBy: { [sortBy]: sortOrder },
    });

    const mappedCampaigns = campaigns.map((camp: any) => {
      const stats = camp.analytics.reduce((acc: any, a: any) => {
        acc.impressions += a.impressions;
        acc.clicks += a.clicks;
        return acc;
      }, { impressions: 0, clicks: 0 });

      return {
        id: camp.id,
        name: camp.name,
        advertiserName: camp.advertiser.companyName,
        status: camp.status,
        impressions: stats.impressions.toLocaleString(),
        clicks: stats.clicks.toLocaleString(),
        budget: `$${(camp.totalBudget / 100).toLocaleString()}`,
        createdAt: camp.createdAt,
      };
    });

    return NextResponse.json(mappedCampaigns);
  } catch (err) {
    console.error('HQ Get campaigns error:', err);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
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

    await prisma.adCampaign.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('HQ Delete campaigns error:', err);
    return NextResponse.json({ error: 'Failed to delete campaigns' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sessionData = await getSession(token);

    if (!sessionData || sessionData.sessionType !== 'admin') {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { id, data } = await request.json();

    if (!id || !data) {
      return NextResponse.json({ error: 'id and data required' }, { status: 400 });
    }

    const updated = await prisma.adCampaign.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch (err) {
    console.error('HQ Update campaign error:', err);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}
