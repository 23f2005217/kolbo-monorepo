import { NextRequest, NextResponse } from 'next/server';
import { getAdvertiserSession, ADS_SESSION_COOKIE_NAME } from "@kolbo/auth";
import { adCampaignQueries } from "@kolbo/database";

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
    const status = searchParams.get('status') || undefined;

    const campaigns = await adCampaignQueries.findByAdvertiserId(session.id, { status });

    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign: any) => {
        const stats = await adCampaignQueries.getStats(campaign.id);
        return {
          ...campaign,
          totalBudget: campaign.totalBudget / 100,
          dailyBudget: campaign.dailyBudget ? campaign.dailyBudget / 100 : null,
          stats,
        };
      })
    );

    return NextResponse.json({ campaigns: campaignsWithStats });
  } catch (err) {
    console.error('Get campaigns error:', err);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(ADS_SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = await getAdvertiserSession(token);

    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const body = await request.json();
    const { name, objective, description, totalBudget, dailyBudget, startDate, endDate, frequencyCap, frequencyPeriod, targeting } = body;

    if (!name || !objective || !totalBudget || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const campaign = await adCampaignQueries.create({
      advertiserId: session.id,
      name,
      objective,
      description,
      totalBudget,
      dailyBudget,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      frequencyCap,
      frequencyPeriod,
      targeting,
    });

    return NextResponse.json({
      campaign: {
        ...campaign,
        totalBudget: campaign.totalBudget / 100,
        dailyBudget: campaign.dailyBudget ? campaign.dailyBudget / 100 : null,
      },
    });
  } catch (err) {
    console.error('Create campaign error:', err);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
