import { NextRequest, NextResponse } from 'next/server';
import prisma from "@kolbo/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const entitlements = await prisma.entitlement.findMany({
      where: { userId },
      orderBy: { startsAt: 'desc' },
    });

    return NextResponse.json(entitlements);
  } catch (error) {
    console.error('Error fetching user entitlements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entitlements' },
      { status: 500 }
    );
  }
}
