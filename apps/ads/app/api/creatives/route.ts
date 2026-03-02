import { NextRequest, NextResponse } from 'next/server';
import { getAdvertiserSession, ADS_SESSION_COOKIE_NAME } from "@kolbo/auth";
import { adCreativeQueries } from "@kolbo/database";
import { supabase } from "@/supabase";
import prisma from "@kolbo/database";

const storageBucket = 'ad-creatives';

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
    const campaignId = searchParams.get('campaignId') || undefined;

    let creatives;
    if (campaignId) {
      creatives = await adCreativeQueries.findByCampaignId(campaignId);
    } else {
      creatives = await adCreativeQueries.findByAdvertiserId(session.id);
    }

     const creativesWithUrls = creatives.map((creative: any) => {
       let url = null;
      if (creative.muxPlaybackId) {
        url = `https://stream.mux.com/${creative.muxPlaybackId}.m3u8`;
      } else if (creative.storageBucket && creative.storagePath) {
        const { data: publicUrlData } = supabase.storage
          .from(creative.storageBucket)
          .getPublicUrl(creative.storagePath);
        url = publicUrlData.publicUrl;
      }

      return {
        ...creative,
        url,
      };
    });

    return NextResponse.json({ creatives: creativesWithUrls });
  } catch (err) {
    console.error('Get creatives error:', err);
    return NextResponse.json({ error: 'Failed to fetch creatives' }, { status: 500 });
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

    const { name, campaignId, muxUploadId } = await request.json();

    if (!name || !muxUploadId) {
      return NextResponse.json({ error: 'Name and muxUploadId are required' }, { status: 400 });
    }

    // Validate campaignId if provided
    if (campaignId) {
      const campaign = await prisma.adCampaign.findUnique({
        where: { id: campaignId },
      });

      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      if (campaign.advertiserId !== session.id) {
        return NextResponse.json({ error: 'Campaign does not belong to this advertiser' }, { status: 403 });
      }
    }

    const creative = await adCreativeQueries.create({
      advertiserId: session.id,
      campaignId: campaignId || undefined,
      name,
      muxUploadId,
      status: 'pending',
    });

    return NextResponse.json({
      creative: {
        ...creative,
        url: null, // Mux URL will be available after webhook processing
      },
    });
  } catch (err: any) {
    console.error('Upload creative error:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      meta: err.meta,
    });
    return NextResponse.json({ 
      error: 'Failed to upload creative',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}
