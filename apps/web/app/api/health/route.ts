import { NextResponse } from "next/server";
import prisma from "@kolbo/database";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Database connection failed:", error);
    return NextResponse.json(
      { status: "error", database: "disconnected", message: String(error) },
      { status: 500 }
    );
  }
}
