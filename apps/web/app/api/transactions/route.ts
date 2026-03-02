import { NextRequest, NextResponse } from "next/server";
import { transactionQueries } from "@kolbo/database";

export async function GET() {
  try {
    const transactions = await transactionQueries.findAll();
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const transaction = await transactionQueries.create(data);
    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
