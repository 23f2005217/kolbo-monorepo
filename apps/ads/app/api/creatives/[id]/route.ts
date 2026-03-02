import { NextRequest, NextResponse } from 'next/server';
import { getAdvertiserSession, ADS_SESSION_COOKIE_NAME } from "@kolbo/auth";
import { adCreativeQueries } from "@kolbo/database";
import { supabase } from "@/supabase";

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
    const creative = await adCreativeQueries.findById(id);

    if (!creative) {
      return NextResponse.json({ error: 'Creative not found' }, { status: 404 });
    }

    if (creative.advertiserId !== session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const stats = await adCreativeQueries.getStats(id);

    const { data: publicUrlData } = supabase.storage
      .from(creative.storageBucket!)
      .getPublicUrl(creative.storagePath!);

    return NextResponse.json({
      creative: {
        ...creative,
        url: publicUrlData.publicUrl,
        stats,
      },
    });
  } catch (err) {
    console.error('Get creative error:', err);
    return NextResponse.json({ error: 'Failed to fetch creative' }, { status: 500 });
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
    const existing = await adCreativeQueries.findById(id);

    if (!existing) {
      return NextResponse.json({ error: 'Creative not found' }, { status: 404 });
    }

    if (existing.advertiserId !== session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (existing.storageBucket && existing.storagePath) {
      await supabase.storage.from(existing.storageBucket).remove([existing.storagePath]);
    }

    await adCreativeQueries.delete(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete creative error:', err);
    return NextResponse.json({ error: 'Failed to delete creative' }, { status: 500 });
  }
}
