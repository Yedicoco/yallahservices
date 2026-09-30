import type { LinkedInConfig } from '../config'

/**
 * Client LinkedIn (OpenID Connect + Posts API /rest/posts) pour le hub d'intégrations.
 *
 * Le jeton d'accès LinkedIn est valable 60 jours et n'est PAS renouvelable (pas de
 * refresh_token) : le cron le signale donc « no_refresh », et la reconnexion est requise
 * avant expiration.
 */
export class LinkedInApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 502,
  ) {
    super(message)
    this.name = 'LinkedInApiError'
  }
}

type RestliErrorBody = { error?: string; error_description?: string }

async function api<T>(
  config: LinkedInConfig,
  path: string,
  accessToken: string,
  init: { method?: 'GET' | 'POST' | 'DELETE'; body?: unknown; headers?: Record<string, string> } = {},
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${config.apiBase}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    })
  } catch {
    throw new LinkedInApiError('network_error', 'LinkedIn est injoignable pour le moment.', 504)
  }
  if (response.status === 204) return undefined as T
  const body = (await response.json().catch(() => ({}))) as T & RestliErrorBody
  if (!response.ok || body.error) {
    throw new LinkedInApiError(
      String(body.error ?? `http_${response.status}`),
      body.error_description || 'Erreur renvoyée par LinkedIn.',
      response.status,
    )
  }
  return body
}

// ─── Jeton ──────────────────────────────────────────────────────────────────────────────

export type LinkedInToken = { accessToken: string; expiresIn: number; scope?: string }

/** Échange du code d'autorisation (PKCE : code_verifier inclus). LinkedIn répond 200/201. */
export async function exchangeCode(config: LinkedInConfig, code: string, codeVerifier: string): Promise<LinkedInToken> {
  const form = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code_verifier: codeVerifier,
  })
  let response: Response
  try {
    response = await fetch(`${config.authBase}/accessToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
      body: form,
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new LinkedInApiError('network_error', 'LinkedIn est injoignable pour le moment.', 504)
  }
  const body = (await response.json().catch(() => ({}))) as Partial<{ access_token: string; expires_in: number; scope: string; token_type: string }> & RestliErrorBody
  if (!body.access_token) {
    throw new LinkedInApiError(String(body.error ?? `http_${response.status}`), body.error_description || "LinkedIn a refusé l'échange de jeton.", response.status)
  }
  return { accessToken: body.access_token, expiresIn: body.expires_in ?? 5_184_000, scope: body.scope }
}

/** Profil OpenID Connect minimal (scope r_liteprofile). */
export type LinkedInProfile = { sub: string; name?: string; given_name?: string; family_name?: string }

export async function fetchUserInfo(config: LinkedInConfig, accessToken: string): Promise<LinkedInProfile> {
  return api<LinkedInProfile>(config, '/v2/userinfo', accessToken, { method: 'GET' })
}

// ─── Publication (Posts API v2, « /rest/posts ») ────────────────────────────────────────

/** Téléversement d'une image (format RESTLI, binaire) → identifiant d'image. */
async function uploadImage(config: LinkedInConfig, accessToken: string, imageUrl: string): Promise<string> {
  let source: Response
  try {
    source = await fetch(imageUrl, { cache: 'no-store', signal: AbortSignal.timeout(30000) })
  } catch {
    throw new LinkedInApiError('image_fetch_failed', "L'image est injoignable.")
  }
  if (!source.ok) throw new LinkedInApiError('image_fetch_failed', `Téléchargement de l'image impossible (HTTP ${source.status}).`)
  const contentType = source.headers.get('content-type')?.split(';')[0].trim() || 'image/jpeg'
  if (!contentType.startsWith('image/')) throw new LinkedInApiError('image_fetch_failed', 'La ressource n’est pas une image.')
  const bytes = await source.arrayBuffer()

  const result = await api<{ value: string }>(config, '/rest/images', accessToken, {
    method: 'POST',
    body: Buffer.from(bytes),
    headers: { 'Content-Type': contentType, 'X-Restli-Protocol-Version': 'fs2' },
  })
  return result.value
}

export type RestPostInput = {
  /** « urn:li:members:me » (profil) ou « urn:li:organization:<id> » (Company Page). */
  author: string
  /** Texte de la publication (3 000 caractères max). */
  text?: string
  /** URL publique d'une image : la publication devient un post image. */
  imageUrl?: string
}

/** Publie un post texte ou image, visible par tous (PUBLIC). */
export async function createPost(config: LinkedInConfig, accessToken: string, input: RestPostInput): Promise<{ id: string }> {
  if (!input.text?.trim() && !input.imageUrl) {
    throw new LinkedInApiError('invalid_input', 'Une publication LinkedIn nécessite un texte et/ou une image.')
  }
  const text = input.text?.trim()

  let content: Record<string, unknown>
  if (input.imageUrl) {
    const imageId = await uploadImage(config, accessToken, input.imageUrl)
    content = {
      'com.linkedin.v2.Media': {
        image: { 'com.linkedin.v2.MediaImage': { id: imageId } },
      },
    }
  } else {
    content = { 'com.linkedin.v2.commons.SimpleTextContent': { text: text as string } }
  }

  return api<{ id: string }>(config, '/rest/posts', accessToken, {
    method: 'POST',
    body: {
      author: input.author,
      lifecycleState: 'PUBLISHED',
      visibility: { 'com.linkedin.v2.membership.PublicShareVisibility': {} },
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: text || null,
          shareMediaCategory: input.imageUrl ? 'ARTICLE' : null,
          content,
        },
      },
    },
  })
}
