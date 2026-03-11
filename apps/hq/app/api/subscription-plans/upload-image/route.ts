import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import prisma from '@kolbo/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const storageBucket = 'thumbnails';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const planId = formData.get('planId') as string;

    if (!file || !planId) {
      return NextResponse.json(
        { error: 'File and planId are required' },
        { status: 400 }
      );
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `subscription-plans/${planId}/image-${Date.now()}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabase.storage
      .from(storageBucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('[SubscriptionPlanUpload] Supabase upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload file', details: error.message },
        { status: 500 }
      );
    }

    const { data: signedUrlData } = await supabase.storage
      .from(storageBucket)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365);

    const { data: publicUrlData } = supabase.storage
      .from(storageBucket)
      .getPublicUrl(fileName);

    await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        imageStorageBucket: storageBucket,
        imageStoragePath: fileName,
      },
    });

    const imageUrl = signedUrlData?.signedUrl || publicUrlData.publicUrl;

    return NextResponse.json({
      storageBucket,
      storagePath: fileName,
      publicUrl: imageUrl,
    });
  } catch (error: any) {
    console.error('[SubscriptionPlanUpload] Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image', details: error.message },
      { status: 500 }
    );
  }
}
