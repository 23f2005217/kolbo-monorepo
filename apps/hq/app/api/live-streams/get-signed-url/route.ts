import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: Request) {
  try {
    const { bucket, path } = await request.json();

    if (!bucket || !path) {
      return NextResponse.json(
        { error: 'Bucket and path are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60 * 24); // 24 hours

    if (error) {
      throw error;
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error: any) {
    console.error('Error getting signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to get signed URL', details: error.message },
      { status: 500 }
    );
  }
}
