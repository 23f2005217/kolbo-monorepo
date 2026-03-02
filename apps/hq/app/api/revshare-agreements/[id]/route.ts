import { NextRequest, NextResponse } from "next/server";
import { revShareAgreementQueries } from "@kolbo/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agreement = await revShareAgreementQueries.findById(id);
    if (!agreement) {
      return NextResponse.json(
        { error: "Agreement not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(agreement);
  } catch (error) {
    console.error("Error fetching agreement:", error);
    return NextResponse.json(
      { error: "Failed to fetch agreement" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const agreement = await revShareAgreementQueries.update(id, data);
    return NextResponse.json(agreement);
  } catch (error) {
    console.error("Error updating agreement:", error);
    return NextResponse.json(
      { error: "Failed to update agreement" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await revShareAgreementQueries.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting agreement:", error);
    return NextResponse.json(
      { error: "Failed to delete agreement" },
      { status: 500 }
    );
  }
}
