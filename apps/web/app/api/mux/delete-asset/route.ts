import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { assetId } = await request.json();

    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    // Delete the asset from Mux
    await mux.video.assets.delete(assetId);

    return NextResponse.json({
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting Mux asset:', error);
    // Don't throw error if asset doesn't exist
    return NextResponse.json(
      { message: 'Asset deletion attempted' },
      { status: 200 }
    );
  }
}
