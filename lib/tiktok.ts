import crypto from "crypto";

// Constantes d'authentification OAuth TikTok
export const TIKTOK_AUTHORIZE_URL = "https://www.tiktok.com/v2/auth/authorize/";
export const TIKTOK_STATE_COOKIE = "tiktok_oauth_state";

/**
 * Valide et retourne les variables d'environnement nécessaires pour TikTok.
 */
export function requiredTikTokConfig() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;

  if (!clientKey || !clientSecret || !redirectUri) {
    throw new Error(
      "Variables d'environnement TikTok manquantes. Vérifiez TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET et TIKTOK_REDIRECT_URI."
    );
  }

  return { clientKey, clientSecret, redirectUri };
}

/**
 * Helper de configuration sécurisée des cookies HTTP pour les jetons OAuth/PKCE.
 */
export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}

/**
 * Gestion du chiffrement et déchiffrement des sessions / jetons stockés en cookies.
 */
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.TIKTOK_CLIENT_SECRET ||
  "fallback_secret_key_32_bytes_min!!";

export function encryptSession(data: any): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(SESSION_SECRET, "salt", 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

  let encrypted = cipher.update(JSON.stringify(data));
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSession<T = any>(encryptedData: string): T | null {
  if (!encryptedData) return null;
  try {
    const textParts = encryptedData.split(":");
    if (textParts.length !== 2) return null;

    const iv = Buffer.from(textParts[0], "hex");
    const encryptedText = Buffer.from(textParts[1], "hex");
    const key = crypto.scryptSync(SESSION_SECRET, "salt", 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return JSON.parse(decrypted.toString());
  } catch {
    return null;
  }
}

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
  const { clientKey, redirectUri } = requiredTikTokConfig();

  const params = new URLSearchParams({
    client_key: clientKey,
    scope: "user.info.basic,video.publish",
    response_type: "code",
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `${TIKTOK_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, codeVerifier: string) {
  const { clientKey, clientSecret, redirectUri } = requiredTikTokConfig();

  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
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
    privacyLevel: string;
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
