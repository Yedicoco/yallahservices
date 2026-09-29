import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/tiktok";

// GET /api/tiktok/callback — TikTok redirige ici après autorisation.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const expectedState = req.cookies.get("tiktok_oauth_state")?.value;
  const codeVerifier = req.cookies.get("tiktok_code_verifier")?.value;

  if (error) {
    return NextResponse.redirect(
      new URL(`/connect?error=${encodeURIComponent(error)}`, req.url)
    );
  }
  if (!code || !state || !codeVerifier || state !== expectedState) {
    return NextResponse.redirect(
      new URL("/connect?error=state_mismatch", req.url)
    );
  }

  try {
    const token = await exchangeCodeForToken(code, codeVerifier);

    const res = NextResponse.redirect(new URL("/connect", req.url));

    // MVP : token stocké dans un cookie httpOnly. Pour un usage durable,
    // remplace par un stockage serveur (DB) + refresh automatique avant expiration.
    res.cookies.set("tiktok_access_token", token.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: token.expires_in,
      path: "/",
    });
    res.cookies.set("tiktok_open_id", token.open_id, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: token.expires_in,
      path: "/",
    });
    res.cookies.delete("tiktok_code_verifier");
    res.cookies.delete("tiktok_oauth_state");

    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(
      new URL("/connect?error=token_exchange_failed", req.url)
    );
  }
}
