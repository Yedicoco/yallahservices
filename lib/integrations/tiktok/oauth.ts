import { TIKTOK_AUTHORIZE_URL, tiktokApiBase, type TikTokConfig } from '@/lib/tiktok/config'
import { TikTokApiError } from '@/lib/tiktok/api'
import { refreshAccessToken, revokeToken, type TokenResponse } from '@/lib/tiktok/oauth'
import type { OAuthPending } from '../oauth'

/**
 * Flux OAuth2 « Login Kit for Web » de TikTok pour le hub d'intégrations.
 *
 * Autorisation avec state + PKCE S256 (le flux Web officiel n'exige pas le code_verifier —
 * il est transmis quand même, ignoré tant qu'il n'est pas requis). Échange du code et
 * rafraîchissement côté serveur avec le client_secret.
 */

export function buildAuthorizeUrl(config: TikTokConfig, scope: string, pending: OAuthPending & { codeChallenge: string }): string {
  const params = new URLSearchParams({
    client_key: config.clientKey,
    scope,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    state: pending.state,
    code_challenge: pending.codeChallenge,
    code_challenge_method: 'S256',
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

/** Échange du code d'autorisation contre les jetons (PKCE : code_verifier inclus). */
export function exchangeCode(config: TikTokConfig, code: string, codeVerifier: string): Promise<TokenResponse> {
  return tokenRequest({
    client_key: config.clientKey,
    client_secret: config.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: config.redirectUri,
    code_verifier: codeVerifier,
  })
}

/** Rafraîchissement du jeton d'accès (le nouveau refresh_token remplace l'ancien) et
 *  révocation « au mieux » : repris tels quels du module OAuth existant. */
export { refreshAccessToken, revokeToken }
