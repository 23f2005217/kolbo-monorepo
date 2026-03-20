import { NextResponse, NextRequest } from 'next/server';
import { mux } from '@/mux-client';

export async function POST(request: NextRequest) {
  try {
    const directUpload = await mux.video.uploads.create({
      cors_origin: '*',
      new_asset_settings: {
        playback_policy: ['public'],
      },
    });

    return NextResponse.json({
      uploadUrl: directUpload.url,
      uploadId: directUpload.id,
    });
  } catch (error: any) {
    console.error('Error creating upload:', error);
    
    let failureStage = 'unknown';
    if (error.message?.includes('mux')) failureStage = 'mux_api';

    console.error('Failure Stage:', failureStage);
    if (error.response) {
       console.error('Mux API Error Data:', JSON.stringify(error.response.data));
    }

    return NextResponse.json(
      { 
        error: 'Failed to create upload URL',
        details: error?.message || 'Unknown error',
        stage: failureStage,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      },
      { status: 500 }
    );
  }
}
