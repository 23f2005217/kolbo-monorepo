import { NextRequest, NextResponse } from 'next/server';
import { getSession, ADMIN_SESSION_COOKIE_NAME } from '@kolbo/auth';
import prisma from '@kolbo/database';
import { startOfDay, subDays } from 'date-fns';

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
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Get aggregated metrics
    const aggregates = await prisma.adCampaignAnalytics.aggregate({
      _sum: {
        impressions: true,
        clicks: true,
        conversions: true,
        spend: true,
      },
    });

    const activeCampaignsCount = await prisma.adCampaign.count({
      where: { status: 'active' }
    });

    const totalCampaignsCount = await prisma.adCampaign.count();

    const uniqueUsers = 1004000; // Placeholder until reach logic is implemented

    // Build where clause for performance data
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { objective: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dateFrom || dateTo) {
      where.startDate = {};
      if (dateFrom) where.startDate.gte = new Date(dateFrom);
      if (dateTo) where.startDate.lte = new Date(dateTo);
    }

    const performanceData = await prisma.adCampaign.findMany({
      where,
      include: {
        analytics: {
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedPerformance = performanceData.map((camp: any) => {
      const stats = camp.analytics.reduce((acc: any, a: any) => {
        acc.impressions += a.impressions;
        acc.clicks += a.clicks;
        acc.conversions += a.conversions;
        acc.spend += a.spend;
        return acc;
      }, { impressions: 0, clicks: 0, conversions: 0, spend: 0 });

      const ctr = stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0;
      const cpm = stats.impressions > 0 ? (stats.spend / stats.impressions) * 1000 : 0;
      const cpc = stats.clicks > 0 ? stats.spend / stats.clicks : 0;
      const convRate = stats.clicks > 0 ? (stats.conversions / stats.clicks) * 100 : 0;

      return {
        id: camp.id,
        name: camp.name,
        subtitle: camp.objective,
        status: camp.status.charAt(0).toUpperCase() + camp.status.slice(1),
        duration: camp.endDate 
          ? `${formatDate(camp.startDate)} to ${formatDate(camp.endDate)}`
          : `${formatDate(camp.startDate)} onwards`,
        daysRan: Math.ceil((new Date().getTime() - new Date(camp.startDate).getTime()) / (1000 * 60 * 60 * 24)),
        impressions: stats.impressions.toLocaleString(),
        clicks: stats.clicks.toLocaleString(),
        ctr: `${ctr.toFixed(1)}%`,
        spend: `$${(stats.spend / 100).toLocaleString()}`,
        cpm: `$${(cpm / 100).toFixed(2)}`,
        cpc: `$${(cpc / 100).toFixed(2)}`,
        conversions: stats.conversions.toLocaleString(),
        convRate: `${convRate.toFixed(1)}%`,
      };
    });

    return NextResponse.json({
      metrics: [
        { label: 'Total Spend', value: `$${((aggregates._sum.spend || 0) / 100).toLocaleString()}`, subtext: 'All campaigns' },
        { label: 'Impressions', value: (aggregates._sum.impressions || 0).toLocaleString(), subtext: 'Total views' },
        { label: 'Clicks', value: (aggregates._sum.clicks || 0).toLocaleString(), subtext: `${(aggregates._sum.impressions ? ((aggregates._sum.clicks || 0) / aggregates._sum.impressions * 100).toFixed(2) : 0)}% CTR` },
        { label: 'Conversions', value: (aggregates._sum.conversions || 0).toLocaleString(), subtext: 'Total conversions' },
        { label: 'Reach', value: uniqueUsers.toLocaleString(), subtext: 'Unique users' },
        { label: 'Active Campaigns', value: activeCampaignsCount.toString(), subtext: `of ${totalCampaignsCount} total` },
      ],
      performance: mappedPerformance
    });
  } catch (err) {
    console.error('HQ Get ad analytics error:', err);
    return NextResponse.json({ error: 'Failed to fetch ad analytics' }, { status: 500 });
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}
