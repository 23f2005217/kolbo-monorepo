import { NextRequest, NextResponse } from "next/server";
import { revShareAgreementQueries } from "@kolbo/database";

export async function GET() {
  try {
    const agreements = await revShareAgreementQueries.findAll();
    return NextResponse.json(agreements);
  } catch (error) {
    console.error("Error fetching agreements:", error);
    return NextResponse.json(
      { error: "Failed to fetch agreements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const agreement = await revShareAgreementQueries.create(data);
    return NextResponse.json(agreement);
  } catch (error) {
    console.error("Error creating agreement:", error);
    return NextResponse.json(
      { error: "Failed to create agreement" },
      { status: 500 }
    );
  }
}
