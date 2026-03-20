import { NextRequest, NextResponse } from 'next/server';
import { getAdvertiserSession, ADS_SESSION_COOKIE_NAME } from "@kolbo/auth";
import { adCampaignQueries } from "@kolbo/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get(ADS_SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = await getAdvertiserSession(token);

    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const { id } = await params;
    const campaign = await adCampaignQueries.findById(id);

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.advertiserId !== session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const stats = await adCampaignQueries.getStats(id);

    return NextResponse.json({
      campaign: {
        ...campaign,
        totalBudget: campaign.totalBudget / 100,
        dailyBudget: campaign.dailyBudget ? campaign.dailyBudget / 100 : null,
        stats,
      },
    });
  } catch (err) {
    console.error('Get campaign error:', err);
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get(ADS_SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = await getAdvertiserSession(token);

    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await adCampaignQueries.findById(id);

    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (existing.advertiserId !== session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, objective, description, status, totalBudget, dailyBudget, startDate, endDate, frequencyCap, frequencyPeriod, targeting } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (objective !== undefined) updateData.objective = objective;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (totalBudget !== undefined) updateData.totalBudget = totalBudget;
    if (dailyBudget !== undefined) updateData.dailyBudget = dailyBudget ? dailyBudget : null;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (frequencyCap !== undefined) updateData.frequencyCap = frequencyCap;
    if (frequencyPeriod !== undefined) updateData.frequencyPeriod = frequencyPeriod;
    if (targeting !== undefined) updateData.targeting = targeting;

    const campaign = await adCampaignQueries.update(id, updateData);

    return NextResponse.json({
      campaign: {
        ...campaign,
        totalBudget: campaign.totalBudget / 100,
        dailyBudget: campaign.dailyBudget ? campaign.dailyBudget / 100 : null,
      },
    });
  } catch (err) {
    console.error('Update campaign error:', err);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get(ADS_SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const session = await getAdvertiserSession(token);

    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await adCampaignQueries.findById(id);

    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (existing.advertiserId !== session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await adCampaignQueries.delete(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete campaign error:', err);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}
