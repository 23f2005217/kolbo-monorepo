import { NextRequest, NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

// Initialize Mux with JWT signing keys
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
  jwtSigningKey: process.env.MUX_SIGNING_KEY_ID!,
  jwtPrivateKey: process.env.MUX_SIGNING_KEY_PRIVATE!,
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const testPlaybackId = searchParams.get('playbackId') || 'test-playback-id';
    
    console.log('Testing Mux signing with playback ID:', testPlaybackId);
    console.log('Signing Key ID:', process.env.MUX_SIGNING_KEY_ID ? '✓ Configured' : '✗ Missing');
    console.log('Signing Key Private:', process.env.MUX_SIGNING_KEY_PRIVATE ? '✓ Configured' : '✗ Missing');
    
    if (!process.env.MUX_SIGNING_KEY_ID || !process.env.MUX_SIGNING_KEY_PRIVATE) {
      return NextResponse.json({
        success: false,
        error: 'Mux signing keys not configured',
        env: {
          MUX_SIGNING_KEY_ID: process.env.MUX_SIGNING_KEY_ID ? 'Present' : 'Missing',
          MUX_SIGNING_KEY_PRIVATE: process.env.MUX_SIGNING_KEY_PRIVATE ? 'Present' : 'Missing',
        }
      }, { status: 400 });
    }
    
    // Test video token generation
    const videoToken = await mux.jwt.signPlaybackId(testPlaybackId, {
      expiration: '2m',
      type: 'video',
    });
    
    const videoUrl = `https://stream.mux.com/${testPlaybackId}.m3u8?token=${videoToken}`;
    
    // Test thumbnail token generation (same signing key, different type)
    const thumbnailToken = await mux.jwt.signPlaybackId(testPlaybackId, {
      expiration: '1h',
      type: 'thumbnail',
    });
    
    const thumbnailUrl = `https://image.mux.com/${testPlaybackId}/thumbnail.jpg?token=${thumbnailToken}`;
    
    return NextResponse.json({
      success: true,
      message: 'Mux signing working correctly',
      video: {
        token: videoToken,
        url: videoUrl,
        expiration: '2 minutes',
        claims: {
          aud: 'v', // 'v' for video
          sub: testPlaybackId,
        }
      },
      thumbnail: {
        token: thumbnailToken,
        url: thumbnailUrl,
        expiration: '1 hour',
        claims: {
          aud: 't', // 't' for thumbnail
          sub: testPlaybackId,
        }
      },
      verification: {
        tokensDifferent: videoToken !== thumbnailToken,
        sameSigningKey: true,
      }
    });
    
  } catch (error: any) {
    console.error('Mux signing test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      type: error.constructor.name,
      details: {
        MUX_SIGNING_KEY_ID: process.env.MUX_SIGNING_KEY_ID ? 'Present' : 'Missing',
        MUX_SIGNING_KEY_PRIVATE: process.env.MUX_SIGNING_KEY_PRIVATE ? 'Present' : 'Missing',
        MUX_TOKEN_ID: process.env.MUX_TOKEN_ID ? 'Present' : 'Missing',
      }
    }, { status: 500 });
  }
}