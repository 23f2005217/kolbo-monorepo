import { NextRequest, NextResponse } from 'next/server';
import { getSession, ADMIN_SESSION_COOKIE_NAME, SessionData } from '@kolbo/auth';
import prisma from '@kolbo/database';
import { supabase } from '@/supabase';

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
        { campaign: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const creatives = await prisma.adCreative.findMany({
      where,
      include: {
        advertiser: { select: { companyName: true } },
        campaign: { select: { name: true } },
      },
      orderBy: { [sortBy]: sortOrder },
    });

    const creativesWithUrls = creatives.map((creative: any) => {
      const { data: publicUrlData } = supabase.storage
        .from(creative.storageBucket || '')
        .getPublicUrl(creative.storagePath || '');

      return {
        ...creative,
        url: publicUrlData.publicUrl,
      };
    });

    return NextResponse.json(creativesWithUrls);
  } catch (err) {
    console.error('HQ Get ad creatives error:', err);
    return NextResponse.json({ error: 'Failed to fetch ad creatives' }, { status: 500 });
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

    const creatives = await prisma.adCreative.findMany({
      where: { id: { in: ids } },
    });

    for (const creative of creatives) {
      if (creative.storageBucket && creative.storagePath) {
        await supabase.storage
          .from(creative.storageBucket)
          .remove([creative.storagePath]);
      }
    }

    await prisma.adCreative.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('HQ Delete ad creatives error:', err);
    return NextResponse.json({ error: 'Failed to delete ad creatives' }, { status: 500 });
  }
}
