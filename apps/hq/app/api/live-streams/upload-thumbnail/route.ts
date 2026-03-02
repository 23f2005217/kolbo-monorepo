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
    const streamId = formData.get('streamId') as string;

    if (!file || !streamId) {
      return NextResponse.json(
        { error: 'File and streamId are required' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `live-streams/${streamId}/thumbnail-${Date.now()}.${fileExt}`;

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

    // Get signed URL
    const { data: signedUrlData } = await supabase.storage
      .from(storageBucket)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365); 

    // Update database record
    await prisma.liveStream.update({
      where: { id: streamId },
      data: {
        thumbnailStorageBucket: storageBucket,
        thumbnailStoragePath: fileName,
      },
    });

    return NextResponse.json({
      storageBucket: storageBucket,
      storagePath: fileName,
      publicUrl: signedUrlData?.signedUrl,
    });
  } catch (error: any) {
    console.error('Error uploading live stream thumbnail:', error);
    return NextResponse.json(
      { error: 'Failed to upload thumbnail', details: error.message },
      { status: 500 }
    );
  }
}
