import { createHmac } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { json } from '@/lib/http'
import { safeEqual } from '@/lib/security/compare'
import { ConfigError } from '@/lib/security/secrets'
import { metaConfig, metaVerifyToken, metaWebhookSecret } from '@/lib/integrations/config'
import { clearAccount, webhookEventKey } from '@/lib/integrations/tokens'
import { getStore } from '@/lib/storage/kv'

/**
 * HUB INTÉGRATIONS — Meta : webhooks « Subscriptions » (Graph API).
 * URI à déclarer dans le dashboard de l'application (Webhooks) :
 * https://<domaine>/api/integrations/meta/webhooks/events
 *
 * Sécurité (échec fermé, route publique) :
 *  - GET de vérification : le hub.verify_token doit correspondre (si META_WEBHOOK_VERIFY_TOKEN
 *    est défini), et la signature X-Hub-Signature-256 est vérifiée si présente ;
 *  - POST : signature OBLIGATOIRE — sha256 hex de HMAC(META_WEBHOOK_SECRET ou app secret, corps
 *    brut) — comparée en temps constant.
 *
 * Événements traités :
 *  - « instagram » / champ « media » : statut de publication (PUBLISHED, ERROR…) conservé ;
 *  - « user » / champ « account_status_change » (compte désactivé/terminé) : suppression
 *    des jetons Meta stockés (le compte ne peut plus servir à publier).
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EVENT_TTL_SECONDS = 7 * 24 * 3600

type HubConfig = { verifyToken: string | null; secret: string }

function hubConfig(): HubConfig {
  const config = metaConfig() // lève ConfigError si l'application n'est pas configurée
  return { verifyToken: metaVerifyToken(), secret: metaWebhookSecret(config) as string }
}

function isValidSignature(secret: string, signatureHeader: string | null, rawBody: string): boolean {
  if (!signatureHeader) return false
  const match = signatureHeader.match(/^sha256=([0-9a-f]+)$/i)
  if (!match) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  return safeEqual(expected, match[1])
}

export async function GET(request: NextRequest) {
  let config: HubConfig
  try {
    config = hubConfig()
  } catch (error) {
    if (error instanceof ConfigError) return json({ error: { code: 'config' } }, 503)
    throw error
  }

  const params = request.nextUrl.searchParams
  if (params.get('hub.mode') !== 'subscribe') return json({ error: { code: 'not_subscribed' } }, 400)

  const rawBody = await request.text()
  if (config.verifyToken && !safeEqual(params.get('hub.verify_token') ?? '', config.verifyToken)) {
    return json({ error: { code: 'invalid_verify_token' } }, 401)
  }
  if (request.headers.get('x-hub-signature-256') !== null && !isValidSignature(config.secret, request.headers.get('x-hub-signature-256'), rawBody)) {
    return json({ error: { code: 'invalid_signature' } }, 401)
  }

  const challenge = params.get('hub.challenge')
  if (!challenge) return json({ error: { code: 'challenge_missing' } }, 400)
  return new Response(challenge, {
    status: 200,
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' },
  })
}

type MetaEvent = {
  object?: string
  entry?: Array<{
    id?: string
    time?: number
    changes?: Array<{ field?: string; value?: Record<string, unknown> | string }>
  }>
}

export async function POST(request: NextRequest) {
  let config: HubConfig
  try {
    config = hubConfig()
  } catch (error) {
    if (error instanceof ConfigError) return json({ error: { code: 'config' } }, 503)
    throw error
  }

  const rawBody = await request.text()
  if (!isValidSignature(config.secret, request.headers.get('x-hub-signature-256'), rawBody)) {
    return json({ error: { code: 'invalid_signature' } }, 401)
  }

  let event: MetaEvent
  try {
    event = JSON.parse(rawBody) as MetaEvent
  } catch {
    return json({ error: { code: 'invalid_json' } }, 400)
  }

  // Meta renvoie l'événement deux fois s'il ne répond pas « ok » : on traite en mémoire
  // légère et on répond toujours 200.
  for (const entry of event.entry ?? []) {
    for (const change of entry.changes ?? []) {
      // Statut d'une publication Instagram (Reel / carrousel) : conservé 7 jours.
      if (event.object === 'instagram' && change.field === 'media' && change.value && typeof change.value === 'object' && typeof change.value.id === 'string') {
        void getStore()
          .set(webhookEventKey('meta', `ig-media:${change.value.id}`), rawBody, EVENT_TTL_SECONDS)
          .catch(() => undefined)
      }
      // Compte utilisateur désactivé/terminé : plus aucun jeton ne peut servir.
      if (event.object === 'user' && change.field === 'account_status_change') {
        const value = typeof change.value === 'string' ? change.value : ''
        if (/disabled|terminated/i.test(value)) {
          try {
            await clearAccount('meta')
          } catch (error) {
            console.error('[integrations:meta:webhooks] suppression du compte impossible', error instanceof Error ? error.message : '')
          }
        }
      }
    }
  }

  return json({ ok: true })
}
