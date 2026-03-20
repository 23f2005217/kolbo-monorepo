import { NextResponse } from 'next/server';
import { subsiteQueries } from '@kolbo/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const subsite: any = await subsiteQueries.findBySlug(slug);
      
      if (!subsite) {
        return NextResponse.json({ error: 'Subsite not found' }, { status: 404 });
      }
      return NextResponse.json(subsite);
    }

    const subsites = await subsiteQueries.findAll();
    return NextResponse.json(subsites);
  } catch (error) {
    console.error('Error fetching subsites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subsites' },
      { status: 500 }
    );
  }
}
