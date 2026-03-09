import { NextResponse } from "next/server";
import { getYieldCurve } from "@/lib/services/di-futures";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getYieldCurve();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching yield curve:", error);
    return NextResponse.json(
      { error: "Failed to fetch yield curve data" },
      { status: 500 }
    );
  }
}
