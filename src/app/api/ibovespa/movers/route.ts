import { NextResponse } from "next/server";
import { getIbovespaMovers } from "@/lib/services/ibovespa";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getIbovespaMovers();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching movers:", error);
    return NextResponse.json(
      { error: "Failed to fetch movers data" },
      { status: 500 }
    );
  }
}
