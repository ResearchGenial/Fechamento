import { NextResponse } from "next/server";
import { getDIVariation } from "@/lib/services/di-futures";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getDIVariation();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching DI variation:", error);
    return NextResponse.json(
      { error: "Failed to fetch DI variation data" },
      { status: 500 }
    );
  }
}
