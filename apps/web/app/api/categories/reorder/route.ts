import { NextResponse } from 'next/server';
import prisma from "@kolbo/database";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categories } = body;

    if (!Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'categories must be an array' },
        { status: 400 }
      );
    }

    const updates = categories.map(({ id, position }: { id: string; position: number }) =>
      prisma.category.update({
        where: { id },
        data: { position },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ message: 'Categories reordered successfully' });
  } catch (error) {
    console.error('Error reordering categories:', error);
    return NextResponse.json(
      { error: 'Failed to reorder categories' },
      { status: 500 }
    );
  }
}
