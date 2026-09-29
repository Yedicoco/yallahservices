import { NextResponse } from "next/server";
import crypto from "crypto";
import { generatePkcePair, buildAuthorizeUrl } from "@/lib/tiktok";

// GET /api/tiktok/connect — redirige l'utilisateur vers l'écran d'autorisation TikTok.
export async function GET() {
  const { codeVerifier, codeChallenge } = generatePkcePair();
  const state = crypto.randomBytes(16).toString("hex");

  const res = NextResponse.redirect(buildAuthorizeUrl(codeChallenge, state));

  // Cookies temporaires, httpOnly, lus une seule fois par le callback.
  res.cookies.set("tiktok_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  res.cookies.set("tiktok_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return res;
}
