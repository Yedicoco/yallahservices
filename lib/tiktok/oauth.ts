import { randomBytes } from 'node:crypto'
import { TikTokApiError } from './api'
import { TIKTOK_AUTHORIZE_URL, tiktokApiBase, type TikTokConfig } from './config'

/**
 * OAuth TikTok « Login Kit for Web ».
 *
 * Flux documenté par TikTok pour le Web : `state` anti-CSRF (cookie HttpOnly comparé au retour)
 * et échange du code côté serveur avec le client_secret. PKCE (`code_verifier`) n'est requis par
 * TikTok que pour les applications mobiles et desktop : on s'en tient donc au flux Web officiel.
 */
export type TokenResponse = {
  access_token: string
  refresh_token?: string
  open_id: string
  scope?: string
  /** Durée de vie du jeton d'accès en secondes (24 h chez TikTok). */
  expires_in: number
  /** Durée de vie du jeton de rafraîchissement en secondes (365 jours chez TikTok). */
  refresh_expires_in?: number
  token_type?: string
}

export function newState(): string {
  return randomBytes(24).toString('hex')
}

export function buildAuthorizeUrl(config: TikTokConfig, scope: string, state: string): string {
  const params = new URLSearchParams({
    client_key: config.clientKey,
    scope,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    state,
  })
  return `${TIKTOK_AUTHORIZE_URL}?${params.toString()}`
}

const FORM_HEADERS = { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' }

async function tokenRequest(form: Record<string, string>): Promise<TokenResponse> {
  let response: Response
  try {
    response = await fetch(`${tiktokApiBase()}/v2/oauth/token/`, {
      method: 'POST',
      headers: FORM_HEADERS,
      body: new URLSearchParams(form),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new TikTokApiError('network_error', 'TikTok est injoignable pour le moment.', 504)
  }
  const body = (await response.json().catch(() => ({}))) as Partial<TokenResponse> & { error?: string; error_description?: string }
  // TikTok peut signaler une erreur avec un statut HTTP 200 : on exige un jeton dans la réponse.
  if (!response.ok || !body.access_token || !body.open_id) {
    throw new TikTokApiError(body.error ?? `http_${response.status}`, body.error_description || "TikTok a refusé l'échange de jeton.", response.status)
  }
  return body as TokenResponse
}

export function exchangeCode(config: TikTokConfig, code: string): Promise<TokenResponse> {
  return tokenRequest({
    client_key: config.clientKey,
    client_secret: config.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: config.redirectUri,
  })
}

/** Le refresh_token renvoyé peut différer de l'ancien : l'appelant doit toujours enregistrer le nouveau. */
export function refreshAccessToken(config: TikTokConfig, refreshToken: string): Promise<TokenResponse> {
  return tokenRequest({
    client_key: config.clientKey,
    client_secret: config.clientSecret,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })
}

/** Révocation « au mieux » : un échec ne doit jamais bloquer le parcours de l'utilisateur. */
export async function revokeToken(config: TikTokConfig, token: string): Promise<void> {
  try {
    await fetch(`${tiktokApiBase()}/v2/oauth/revoke/`, {
      method: 'POST',
      headers: FORM_HEADERS,
      body: new URLSearchParams({ client_key: config.clientKey, client_secret: config.clientSecret, token }),
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    })
  } catch {
    // volontairement ignoré
  }
}
