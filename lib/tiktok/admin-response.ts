import type { NextResponse } from 'next/server'
import { json } from '@/lib/http'
import { ConfigError } from '@/lib/security/secrets'
import { NotConnectedError, ReconnectRequiredError } from '@/lib/storage/admin-account'
import { StorageError } from '@/lib/storage/kv'
import { TikTokApiError } from './api'
import { requiresReconnect, tiktokErrorHint } from './errors'

/**
 * Traduit toute erreur des routes internes en réponse JSON stable pour l'interface :
 *  - « pas connecté » / « reconnexion nécessaire » → 200 { connected: false, reconnect?, message? }
 *  - configuration ou stockage manquant           → 503 { error: { code, message } }
 *  - refus de TikTok                              → 502 { error: { code, message, hint? } }
 * Aucun jeton, secret ou détail technique sensible n'est jamais renvoyé ni journalisé.
 */
export function adminErrorResponse(error: unknown): NextResponse {
  if (error instanceof NotConnectedError) return json({ connected: false })
  if (error instanceof ReconnectRequiredError) return json({ connected: false, reconnect: true, message: error.message })
  if (error instanceof ConfigError || error instanceof StorageError) {
    console.error('[tiktok:admin]', error.name, error.message)
    return json({ error: { code: error instanceof ConfigError ? 'config' : 'storage', message: error.message } }, 503)
  }
  if (error instanceof TikTokApiError) {
    if (requiresReconnect(error.code)) {
      return json({ connected: false, reconnect: true, message: tiktokErrorHint(error.code) ?? error.message })
    }
    return json({ error: { code: error.code, message: error.message, hint: tiktokErrorHint(error.code) } }, 502)
  }
  console.error('[tiktok:admin] erreur inattendue', error instanceof Error ? error.name : typeof error)
  return json({ error: { code: 'internal', message: 'Erreur interne.' } }, 500)
}

/** Raccourci pour un refus de validation (400). */
export function badRequest(code: string, message: string, details?: string[]): NextResponse {
  return json({ error: { code, message, ...(details ? { details } : {}) } }, 400)
}
