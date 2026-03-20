import { NextResponse } from 'next/server';
import { categoryQueries } from '@kolbo/database';

export async function GET() {
  try {
    const categories = await categoryQueries.findAll();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
