import { NextResponse } from 'next/server';
import prisma from "@kolbo/database";

/**
 * Seed subsites: Torah Live, Toveedo Test, Comedy Test.
 * Creates them only if they don't exist (by slug).
 * POST /api/seed/subsites
 */
export async function POST() {
  try {
    const subsites = [
      { name: 'Torah Live', slug: 'torah-live', description: 'Torah education and inspiration' },
      { name: 'Toveedo Test', slug: 'toveedo-test', description: 'Test channel for Toveedo' },
      { name: 'Comedy Test', slug: 'comedy-test', description: 'Test channel for comedy content' },
    ];

    const created: string[] = [];
    for (const sub of subsites) {
      const existing = await prisma.subsite.findUnique({ where: { slug: sub.slug } });
      if (!existing) {
        await prisma.subsite.create({
          data: {
            name: sub.name,
            slug: sub.slug,
            description: sub.description,
            isActive: true,
          },
        });
        created.push(sub.slug);
      }
    }

    return NextResponse.json({
      message: 'Subsites seeded',
      created,
      existing: subsites.filter((s) => !created.includes(s.slug)).map((s) => s.slug),
    });
  } catch (error) {
    console.error('Error seeding subsites:', error);
    return NextResponse.json(
      { error: 'Failed to seed subsites', details: String(error) },
      { status: 500 }
    );
  }
}
