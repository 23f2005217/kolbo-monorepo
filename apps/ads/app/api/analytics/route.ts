import { NextRequest, NextResponse } from 'next/server';
import { getAdvertiserSession, ADS_SESSION_COOKIE_NAME } from "@kolbo/auth";
import { adAnalyticsQueries } from "@kolbo/database";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(ADS_SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = await getAdvertiserSession(token);

    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    const stats = await adAnalyticsQueries.getAdvertiserStats(session.id, startDate, endDate);

    return NextResponse.json({
      analytics: {
        ...stats,
        totals: {
          ...stats.totals,
          spend: stats.totals.spend / 100,
        },
      },
    });
  } catch (err) {
    console.error('Get analytics error:', err);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
