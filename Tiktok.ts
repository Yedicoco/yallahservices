import crypto from "crypto";

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY!;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET!;
// Doit correspondre EXACTEMENT (schéma, host, chemin, slash final) à ce qui
// est déclaré dans le portail TikTok Developers pour ton App.
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI!;

export function base64url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generatePkcePair() {
  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(
    crypto.createHash("sha256").update(codeVerifier).digest()
  );
  return { codeVerifier, codeChallenge };
}

export function buildAuthorizeUrl(codeChallenge: string, state: string) {
  const params = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    scope: "user.info.basic,video.publish",
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, codeVerifier: string) {
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      client_secret: TIKTOK_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });
  if (!res.ok) {
    throw new Error(`Échange de token échoué: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<{
    access_token: string;
    expires_in: number;
    open_id: string;
    refresh_token: string;
    scope: string;
  }>;
}

export async function getCreatorInfo(accessToken: string) {
  const res = await fetch(
    "https://open.tiktokapis.com/v2/post/publish/creator_info/query/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
    }
  );
  if (!res.ok) {
    throw new Error(`creator_info échoué: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function initDirectPost(
  accessToken: string,
  params: {
    videoUrl: string;
    caption: string;
    privacyLevel: string; // doit être l'une des privacy_level_options renvoyées par creator_info
    disableComment: boolean;
    disableDuet: boolean;
    disableStitch: boolean;
  }
) {
  const res = await fetch(
    "https://open.tiktokapis.com/v2/post/publish/video/init/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        post_info: {
          title: params.caption,
          privacy_level: params.privacyLevel,
          disable_comment: params.disableComment,
          disable_duet: params.disableDuet,
          disable_stitch: params.disableStitch,
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: params.videoUrl,
        },
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`publish/video/init échoué: ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<{ data: { publish_id: string }; error: { code: string } }>;
}
