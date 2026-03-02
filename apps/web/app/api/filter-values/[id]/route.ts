import { NextResponse } from 'next/server';
import { filterQueries } from "@kolbo/database";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const filterValue = await filterQueries.updateValue(id, body);
    return NextResponse.json(filterValue);
  } catch (error) {
    console.error('Error updating filter value:', error);
    return NextResponse.json(
      { error: 'Failed to update filter value' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await filterQueries.deleteValue(id);
    return NextResponse.json({ message: 'Filter value deleted successfully' });
  } catch (error) {
    console.error('Error deleting filter value:', error);
    return NextResponse.json(
      { error: 'Failed to delete filter value' },
      { status: 500 }
    );
  }
}
