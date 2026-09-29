import { NextRequest, NextResponse } from "next/server";
import { initDirectPost } from "@/lib/tiktok";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("tiktok_access_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "not_connected" }, { status: 401 });
  }

  const body = await req.json();
  const { videoUrl, caption, privacyLevel, disableComment, disableDuet, disableStitch } = body;

  if (!videoUrl || !privacyLevel) {
    return NextResponse.json(
      { error: "videoUrl et privacyLevel sont requis" },
      { status: 400 }
    );
  }

  try {
    const result = await initDirectPost(token, {
      videoUrl,
      caption: caption ?? "",
      privacyLevel,
      disableComment: !!disableComment,
      disableDuet: !!disableDuet,
      disableStitch: !!disableStitch,
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "publish_failed" }, { status: 500 });
  }
}
