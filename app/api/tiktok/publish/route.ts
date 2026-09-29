import { NextRequest, NextResponse } from "next/server";
import { getCreatorInfo } from "@/lib/tiktok";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("tiktok_access_token")?.value;
  if (!token) {
    return NextResponse.json({ connected: false }, { status: 200 });
  }
  try {
    const info = await getCreatorInfo(token);
    return NextResponse.json({ connected: true, ...info });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { connected: false, error: "creator_info_failed" },
      { status: 200 }
    );
  }
}
