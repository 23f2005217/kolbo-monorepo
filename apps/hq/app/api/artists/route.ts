import { NextRequest, NextResponse } from "next/server";
import { artistQueries } from "@kolbo/database";

export async function GET() {
  try {
    const artists = await artistQueries.findAll();
    return NextResponse.json(artists);
  } catch (error) {
    console.error("Error fetching artists:", error);
    return NextResponse.json(
      { error: "Failed to fetch artists" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const artist = await artistQueries.create(data);
    return NextResponse.json(artist);
  } catch (error) {
    console.error("Error creating artist:", error);
    return NextResponse.json(
      { error: "Failed to create artist" },
      { status: 500 }
    );
  }
}
