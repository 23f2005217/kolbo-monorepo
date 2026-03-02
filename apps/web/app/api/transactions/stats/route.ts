import { NextResponse } from "next/server";
import { transactionQueries } from "@kolbo/database";

export async function GET() {
  try {
    const stats = await transactionQueries.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
