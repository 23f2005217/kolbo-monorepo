import { NextResponse } from 'next/server';
import { filterQueries } from '@kolbo/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filterId, label, value, position, isActive } = body;
    
    const filterValue = await filterQueries.addValue(filterId, {
      label,
      value,
      position: position || 0,
      isActive: isActive ?? true,
    });
    
    return NextResponse.json(filterValue, { status: 201 });
  } catch (error) {
    console.error('Error creating filter value:', error);
    return NextResponse.json(
      { error: 'Failed to create filter value' },
      { status: 500 }
    );
  }
}
