import { createHash, randomBytes } from 'node:crypto'
import { seal, unseal } from '@/lib/security/seal'
import { sessionSecret } from '@/lib/security/secrets'
import type { Integration } from './config'

/**
 * Éléments communs aux flux OAuth2 des intégrations : state anti-CSRF + PKCE (S256).
 *
 * Le state et le code_verifier voyagent ensemble dans UN cookie chiffré (AES-256-GCM,
 * clé dérivée par HKDF d'un purpose dédié) : HttpOnly, 10 minutes, jamais lisible par le
 * navigateur. Le callback exige que les deux valeurs soient présentes et cohérentes.
 *
 * PKCE : Meta et LinkedIn l'acceptent (et LinkedIn le recommande) ; le flux Web TikTok ne
 * l'exige pas (client_secret côté serveur), mais les paramètres sont transmis quand même —
 * un serveur OAuth qui ne les connaît pas les ignore, et s'ils viennent à être exigés, le
 * flux est déjà conforme.
 */
export type OAuthPending = {
  /** Noncé aléatoire (48 hex) comparé en temps constant au retour du réseau. */
  state: string
  /** code_verifier (base64url, 64 caractères) ; le challenge S256 part dans l'URL d'autorisation. */
  codeVerifier: string
}

const PURPOSE = 'integration-oauth/v1'
const TTL_MS = 10 * 60 * 1000

export function newOAuthState(): string {
  return randomBytes(24).toString('hex')
}

/** Paire PKCE S256 : le challenge est l'empreinte SHA-256 du verifier (RFC 7636). */
export function newPkcePair(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = randomBytes(48).toString('base64url')
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url')
  return { codeVerifier, codeChallenge }
}

export function newOAuthPending(): OAuthPending & { codeChallenge: string } {
  const { codeVerifier, codeChallenge } = newPkcePair()
  return { state: newOAuthState(), codeVerifier, codeChallenge }
}

/** Un cookie distinct par réseau : aucun state ne peut être rejoué d'un flux à l'autre. */
export function oauthCookieName(provider: Integration): string {
  return `yallah_int_${provider}_oauth`
}

type PendingPayload = OAuthPending & { exp: number }

export function createOAuthCookieValue(pending: OAuthPending): string {
  const payload: PendingPayload = { ...pending, exp: Date.now() + TTL_MS }
  return seal(payload, sessionSecret(), PURPOSE)
}

export function readOAuthCookieValue(value: string | null | undefined): OAuthPending | null {
  let secret: string
  try {
    secret = sessionSecret()
  } catch {
    return null
  }
  const payload = unseal<PendingPayload>(value, secret, PURPOSE)
  if (!payload || typeof payload.exp !== 'number' || payload.exp <= Date.now()) return null
  if (typeof payload.state !== 'string' || !payload.state) return null
  if (typeof payload.codeVerifier !== 'string' || !payload.codeVerifier) return null
  return { state: payload.state, codeVerifier: payload.codeVerifier }
}

/** Path « / » volontairement : le retour d'autorisation est une navigation cross-site. */
export function oauthCookieOptions(maxAge = 600) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export function expiredOAuthCookieOptions() {
  return oauthCookieOptions(0)
}
