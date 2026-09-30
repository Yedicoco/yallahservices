import type { NextResponse } from 'next/server'
import { json } from '@/lib/http'
import { ConfigError } from '@/lib/security/secrets'
import { StorageError } from '@/lib/storage/kv'
import { TikTokApiError } from '@/lib/tiktok/api'
import { LinkedInApiError } from './linkedin/api'
import { MetaApiError } from './meta/api'

/** Aucun compte connecté pour ce réseau (jamais connecté, ou déconnecté). */
export class IntegrationNotConnectedError extends Error {
  constructor(readonly provider: string) {
    super(`Aucun compte ${provider} connecté.`)
    this.name = 'IntegrationNotConnectedError'
  }
}

/** Le compte est connu mais l'autorisation n'est plus exploitable : il faut se reconnecter. */
export class IntegrationReconnectError extends Error {
  constructor(readonly provider: string, message = 'La session a expiré : reconnectez le compte.') {
    super(message)
    this.name = 'IntegrationReconnectError'
  }
}

/**
 * Traduit toute erreur des routes d'intégrations en réponse JSON stable :
 *  - « pas connecté » / « reconnexion nécessaire » → 200 { connected: false, provider, reconnect? }
 *  - configuration ou stockage manquant            → 503 { error: { code, message } }
 *  - refus d'un réseau                             → 502 { error: { code, message } }
 * Aucun jeton, secret ou détail technique sensible n'est jamais renvoyé ni journalisé.
 */
export function integrationErrorResponse(error: unknown, provider?: string): NextResponse {
  if (error instanceof IntegrationNotConnectedError) {
    return json({ connected: false, provider: error.provider, message: error.message })
  }
  if (error instanceof IntegrationReconnectError) {
    return json({ connected: false, provider: error.provider, reconnect: true, message: error.message })
  }
  if (error instanceof ConfigError || error instanceof StorageError) {
    console.error(`[integrations:${provider ?? '-'}]`, error.name, error.message)
    return json({ error: { code: error instanceof ConfigError ? 'config' : 'storage', message: error.message } }, 503)
  }
  if (error instanceof TikTokApiError) {
    const code = error.code
    if (code === 'invalid_grant' || code === 'token_expired' || code === 'invalid_token') {
      return json({ connected: false, provider, reconnect: true, message: 'La session a expiré : reconnectez le compte.' })
    }
    return json({ error: { code, message: error.message } }, 502)
  }
  if (error instanceof MetaApiError) {
    // Erreur 190 (jeton invalide/expiré) et 100/200 (access token) → reconnexion.
    if (error.code === '190' || error.code === '100' || error.code === '200') {
      return json({ connected: false, provider, reconnect: true, message: 'Le jeton Meta a expiré : reconnectez le compte.' })
    }
    return json({ error: { code: error.code, message: error.message } }, 502)
  }
  if (error instanceof LinkedInApiError) {
    return json({ error: { code: error.code, message: error.message } }, 502)
  }
  console.error(`[integrations:${provider ?? '-'}] erreur inattendue`, error instanceof Error ? error.name : typeof error)
  return json({ error: { code: 'internal', message: 'Erreur interne.' } }, 500)
}

/** Raccourci pour un refus de validation (400). */
export function badRequest(code: string, message: string, details?: string[]): NextResponse {
  return json({ error: { code, message, ...(details ? { details } : {}) } }, 400)
}
