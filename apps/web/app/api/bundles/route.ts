import { NextResponse } from 'next/server';
import { bundleQueries } from "@kolbo/database";

export async function GET() {
  try {
    const bundles = await bundleQueries.findAll();
    return NextResponse.json(bundles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bundles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const bundle = await bundleQueries.create(body);
    return NextResponse.json(bundle, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create bundle' }, { status: 500 });
  }
}
