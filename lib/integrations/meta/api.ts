import type { MetaConfig } from '../config'

/**
 * Client Graph API Meta (Facebook Pages + Instagram Business) pour le hub d'intégrations.
 *
 * Aucun SDK : de simples requêtes HTTPS (mêmes conventions que le reste du dépôt). Toutes
 * les erreurs réseau/refus sont re-levées en MetaApiError avec le code Meta, sans jamais
 * exposer le jeton.
 */
export class MetaApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 502,
  ) {
    super(message)
    this.name = 'MetaApiError'
  }
}

type GraphErrorBody = {
  error?: { message?: string; type?: string; code?: number; error_subcode?: number }
}

async function graph<T>(
  config: MetaConfig,
  path: string,
  accessToken: string,
  init: { method?: 'GET' | 'POST' | 'DELETE'; params?: Record<string, string>; body?: unknown } = {},
): Promise<T> {
  const url = new URL(`${config.graphBase}/${config.apiVersion}${path}`)
  if (init.params) for (const [key, value] of Object.entries(init.params)) url.searchParams.set(key, value)

  let response: Response
  try {
    response = await fetch(url, {
      method: init.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    })
  } catch {
    throw new MetaApiError('network_error', 'Meta est injoignable pour le moment.', 504)
  }
  const body = (await response.json().catch(() => ({}))) as T & GraphErrorBody
  if (!response.ok || body.error) {
    throw new MetaApiError(
      String(body.error?.code ?? `http_${response.status}`),
      body.error?.message || 'Erreur renvoyée par Meta.',
      response.status,
    )
  }
  return body
}

// ─── Jetons ─────────────────────────────────────────────────────────────────────────────

export type TokenGrant = { accessToken: string; expiresIn: number }

/** Le Graph API répond en snake_case ; le reste du dépôt en camelCase. */
type RawTokenBody = Partial<{ access_token: string; expires_in: number; token_type: string }> & GraphErrorBody

/** Échange du code d'autorisation (PKCE : code_verifier inclus) contre un jeton utilisateur. */
export async function exchangeCode(config: MetaConfig, code: string, codeVerifier: string): Promise<TokenGrant> {
  const form = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    redirect_uri: config.redirectUri,
    code,
    code_verifier: codeVerifier,
  })
  let response: Response
  try {
    response = await fetch(`${config.graphBase}/${config.apiVersion}/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
      body: form,
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new MetaApiError('network_error', 'Meta est injoignable pour le moment.', 504)
  }
  const body = (await response.json().catch(() => ({}))) as RawTokenBody
  if (!response.ok || !body.access_token) {
    throw new MetaApiError(String(body.error?.code ?? `http_${response.status}`), body.error?.message || "Meta a refusé l'échange de jeton.", response.status)
  }
  return { accessToken: body.access_token, expiresIn: body.expires_in ?? 3600 }
}

/**
 * Échange d'un jeton court (utilisateur OU Page) contre un jeton long-lived (~60 jours).
 * Un long-lived encore valide peut lui-même être ré-échangé : c'est la base du
 * rafraîchissement planifié (cf. /api/admin/system/cron/refresh-tokens).
 */
export async function exchangeForLongLived(config: MetaConfig, shortLivedToken: string): Promise<TokenGrant> {
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: config.appId,
    client_secret: config.appSecret,
    fb_exchange_token: shortLivedToken,
  })
  let response: Response
  try {
    response = await fetch(`${config.graphBase}/${config.apiVersion}/oauth/access_token?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new MetaApiError('network_error', 'Meta est injoignable pour le moment.', 504)
  }
  const body = (await response.json().catch(() => ({}))) as RawTokenBody
  if (!response.ok || !body.access_token) {
    throw new MetaApiError(String(body.error?.code ?? `http_${response.status}`), body.error?.message || "Meta a refusé l'échange de jeton.", response.status)
  }
  return { accessToken: body.access_token, expiresIn: body.expires_in ?? 5_184_000 }
}

/** Révocation « au mieux » : un échec ne doit jamais bloquer le parcours. */
export async function revokeToken(config: MetaConfig, token: string): Promise<void> {
  try {
    // Le grant de révocation est « hb_exchange_token » (différent de l'échange « fb_exchange_token »).
    const params = new URLSearchParams({ grant_type: 'hb_exchange_token', access_token: token })
    await fetch(`${config.graphBase}/${config.apiVersion}/oauth/revoke?${params.toString()}`, {
      method: 'DELETE',
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    })
  } catch {
    // volontairement ignoré
  }
}

// ─── Découverte du compte (callback d'autorisation) ────────────────────────────────────

export type GraphPage = { id: string; name: string; access_token?: string }

/** Pages administrables par l'utilisateur, avec leurs jetons courts (scope pages_show_list). */
export async function listManagedPages(config: MetaConfig, userAccessToken: string): Promise<GraphPage[]> {
  const data = await graph<{ data: GraphPage[] }>(config, '/me/pages', userAccessToken, {
    params: { fields: 'id,name,access_token', limit: '100' },
  })
  return data.data ?? []
}

export type InstagramBusiness = { id: string; username?: string }

/** Compte Instagram Business rattaché à une Page (null si la Page n'en a pas). */
export async function instagramBusinessAccount(config: MetaConfig, pageAccessToken: string, pageId: string): Promise<InstagramBusiness | null> {
  const data = await graph<{ instagram_business_account?: InstagramBusiness | null }>(config, `/${pageId}`, pageAccessToken, {
    params: { fields: 'instagram_business_account.id,instagram_business_account.username' },
  })
  return data.instagram_business_account ?? null
}

/** Identité de l'utilisateur (id + nom) pour le compte et le callback de suppression RGPD. */
export async function fetchMe(config: MetaConfig, userAccessToken: string): Promise<{ id: string; name?: string }> {
  return graph<{ id: string; name?: string }>(config, '/me', userAccessToken, { params: { fields: 'id,name' } })
}

// ─── Publication : Facebook Pages ───────────────────────────────────────────────────────

/** Publication texte (optionnellement avec un lien) sur le feed d'une Page. */
export async function postToPageFeed(
  config: MetaConfig,
  pageAccessToken: string,
  pageId: string,
  payload: { message: string; link?: string },
): Promise<{ id: string }> {
  return graph<{ id: string }>(config, `/${pageId}/feed`, pageAccessToken, { method: 'POST', body: payload })
}

/** Téléversement de vidéo sur une Page depuis une URL publique (scope pages_manage_posts). */
export async function postPageVideoByURL(
  config: MetaConfig,
  pageAccessToken: string,
  pageId: string,
  payload: { url: string; description?: string },
): Promise<{ id: string }> {
  return graph<{ id: string }>(config, `/${pageId}/videos`, pageAccessToken, { method: 'POST', body: payload })
}

// ─── Publication : Instagram Business ───────────────────────────────────────────────────

export type InstagramMediaType = 'REELS' | 'IMAGE' | 'CARROUSEL'

/**
 * Création (1ʳᵉ étape des publications Instagram) : renvoie le creation_id.
 * Le jeton utilisé est le jeton PAGE (long-lived) de la Page rattachée au compte IG.
 */
export async function createInstagramMedia(
  config: MetaConfig,
  pageAccessToken: string,
  instagramId: string,
  payload: { mediaType: InstagramMediaType; videoUrl?: string; imageUrl?: string; imageUrls?: string[]; caption?: string },
): Promise<{ creationId: string }> {
  const body: Record<string, unknown> = { media_type: payload.mediaType }
  if (payload.caption) body.caption = payload.caption
  if (payload.mediaType === 'REELS') {
    if (!payload.videoUrl) throw new MetaApiError('invalid_input', 'Un Reel nécessite une vidéo (videoUrl).')
    body.video_url = payload.videoUrl
  } else if (payload.mediaType === 'IMAGE') {
    if (!payload.imageUrl) throw new MetaApiError('invalid_input', 'Une publication image nécessite imageUrl.')
    body.image_url = payload.imageUrl
  } else {
    if (!payload.imageUrls || payload.imageUrls.length === 0) {
      throw new MetaApiError('invalid_input', 'Un carrousel nécessite au moins une image (imageUrls).')
    }
    body.children = payload.imageUrls.map((image_url) => ({ type: 'image', media: { image_url } }))
  }
  const data = await graph<{ id: string }>(config, `/${instagramId}/media`, pageAccessToken, { method: 'POST', body })
  return { creationId: data.id }
}

/** Diffusion (2ᵉ étape) : le creation_id devient une publication. */
export async function publishInstagramMedia(
  config: MetaConfig,
  pageAccessToken: string,
  instagramId: string,
  creationId: string,
): Promise<{ id: string }> {
  return graph<{ id: string }>(config, `/${instagramId}/media_publish`, pageAccessToken, { method: 'POST', body: { creation_id: creationId } })
}
