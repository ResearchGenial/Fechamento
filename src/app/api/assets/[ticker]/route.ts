import { NextResponse } from "next/server";
import { getAssetQuote, VALID_ASSETS } from "@/lib/services/global-assets";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;

    if (!VALID_ASSETS.includes(ticker)) {
      return NextResponse.json(
        { error: `Invalid asset. Valid options: ${VALID_ASSETS.join(", ")}` },
        { status: 400 }
      );
    }

    const data = await getAssetQuote(ticker);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset data" },
      { status: 500 }
    );
  }
}
