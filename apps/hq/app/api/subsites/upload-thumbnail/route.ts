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
    const subsiteId = formData.get('subsiteId') as string;

    if (!file || !subsiteId) {
      return NextResponse.json(
        { error: 'File and subsiteId are required' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `subsites/${subsiteId}/thumbnail-${Date.now()}.${fileExt}`;

    // Convert File to Buffer for Supabase
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(storageBucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload file', details: error.message },
        { status: 500 }
      );
    }

    // Get a signed URL that will work
    const { data: signedUrlData } = await supabase.storage
      .from(storageBucket)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry

    // Also get public URL
    const { data: publicUrlData } = supabase.storage
      .from(storageBucket)
      .getPublicUrl(fileName);

    // Update subsite record
    await prisma.subsite.update({
      where: { id: subsiteId },
      data: {
        thumbnailStorageBucket: storageBucket,
        thumbnailStoragePath: fileName,
      },
    });

    const imageUrl = signedUrlData?.signedUrl || publicUrlData.publicUrl;

    return NextResponse.json({
      storageBucket: storageBucket,
      storagePath: fileName,
      publicUrl: imageUrl,
    });
  } catch (error: any) {
    console.error('Error uploading subsite thumbnail:', error);
    return NextResponse.json(
      { error: 'Failed to upload thumbnail', details: error.message },
      { status: 500 }
    );
  }
}
