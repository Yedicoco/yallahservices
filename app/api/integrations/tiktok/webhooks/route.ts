import { createHmac } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { json } from '@/lib/http'
import { safeEqual } from '@/lib/security/compare'
import { tiktokWebhookSecret } from '@/lib/integrations/config'
import { clearAccount, webhookEventKey } from '@/lib/integrations/tokens'
import { getStore } from '@/lib/storage/kv'

/**
 * HUB INTÉGRATIONS — TikTok : webhooks de la Content Posting API + révocation/RGPD.
 * URI à déclarer dans le tableau de bord TikTok (webhook de l'application Direct Post) :
 * https://<domaine>/api/integrations/tiktok/webhooks
 *
 * Sécurité (échec fermé, route publique) :
 *  - signature HMAC-SHA256 sur « timestamp + corps brut », clé = TIKTOK_WEBHOOK_SECRET
 *    (défaut : client_secret de l'application), en-têtes X-TT-Webhook-Timestamp /
 *    X-TT-Webhook-Signature (base64) — comparée en temps constant ;
 *  - timestamp datant de plus de 5 minutes : rejet (anti-rejeu) ;
 *  - aucune configuration, aucune signature : 401 (on ne répond jamais « ok » à l'aveugle).
 *
 * Événements traités :
 *  - « webhook.verification » → écho du challenge (confirmée la réception par TikTok) ;
 *  - « publish.status.changed » → dernier statut conservé (consultable par l'espace interne) ;
 *  - tout événement de révocation d'autorisation → suppression des jetons stockés (RGPD).
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000
const EVENT_TTL_SECONDS = 7 * 24 * 3600

function expectedSignature(secret: string, timestamp: string, rawBody: string): string {
  return createHmac('sha256', secret).update(`${timestamp}${rawBody}`).digest('base64')
}

export async function POST(request: NextRequest) {
  const secret = tiktokWebhookSecret()
  if (!secret) {
    console.error('[integrations:tiktok:webhooks] secret absent : TIKTOK_WEBHOOK_SECRET ou application non configurée')
    return json({ error: { code: 'config' } }, 503)
  }

  const rawBody = await request.text()
  const timestamp = request.headers.get('x-tt-webhook-timestamp')
  const signature = request.headers.get('x-tt-webhook-signature')
  if (!timestamp || !signature) return json({ error: { code: 'missing_signature' } }, 401)

  // Anti-rejeu : un timestamp hors fenêtre est rejeté avant même la vérification.
  const age = Date.now() - Number(timestamp)
  if (!Number.isFinite(age) || age > MAX_TIMESTAMP_AGE_MS || age < -MAX_TIMESTAMP_AGE_MS) {
    return json({ error: { code: 'stale_timestamp' } }, 401)
  }

  if (!safeEqual(expectedSignature(secret, timestamp, rawBody), signature)) {
    return json({ error: { code: 'invalid_signature' } }, 401)
  }

  let event: { event_type?: string; event_id?: string; challenge?: string; data?: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody) as typeof event
  } catch {
    return json({ error: { code: 'invalid_json' } }, 400)
  }

  const eventType = typeof event.event_type === 'string' ? event.event_type : ''

  // 1) Vérification du webhook : TikTok attend l'écho du challenge pour activer le webhook.
  if (eventType === 'webhook.verification') {
    if (typeof event.challenge !== 'string') return json({ error: { code: 'challenge_missing' } }, 400)
    return json({ challenge: event.challenge })
  }

  // 2) Changement de statut de publication : dernier état conservé (l'UI peut le relire).
  if (eventType === 'publish.status.changed' && event.data && typeof event.data.publish_id === 'string') {
    const publishId = event.data.publish_id.slice(0, 200)
    // Sauvegarde « au mieux » : un échec de stockage ne doit pas faire rejouer l'événement.
    void getStore()
      .set(webhookEventKey('tiktok', `publish:${publishId}`), rawBody, EVENT_TTL_SECONDS)
      .catch(() => undefined)
    return json({ ok: true })
  }

  // 3) Révocation d'autorisation (évènement de type « …revoked ») : on ne garde aucun
  //    jeton d'un compte que son propriétaire a révoqué (exigence RGPD + sécurité).
  if (/revoked|deauthoriz/i.test(eventType)) {
    try {
      await clearAccount('tiktok')
    } catch (error) {
      console.error('[integrations:tiktok:webhooks] suppression du compte impossible', error instanceof Error ? error.message : '')
      return json({ error: { code: 'storage' } }, 503)
    }
    return json({ ok: true, revoked: true })
  }

  // Tout autre événement : ack silencieux (TikTok ne renvoie pas deux fois un événement).
  return json({ ok: true })
}

/**
 * GET : TikTok n'envoie que des POST, mais cette vérification (même schéma de signature,
 * corps vide) permet à un opérateur de contrôler la route depuis l'extérieur SANS révéler
 * sa configuration : sans signature valide, la réponse est identique à celle d'un rejet.
 */
export async function GET(request: NextRequest) {
  const secret = tiktokWebhookSecret()
  if (!secret) return json({ error: { code: 'config' } }, 503)
  const rawBody = await request.text()
  const timestamp = request.headers.get('x-tt-webhook-timestamp')
  const signature = request.headers.get('x-tt-webhook-signature')
  if (!timestamp || !signature) return json({ error: { code: 'missing_signature' } }, 401)
  const age = Date.now() - Number(timestamp)
  if (!Number.isFinite(age) || age > MAX_TIMESTAMP_AGE_MS || age < -MAX_TIMESTAMP_AGE_MS) {
    return json({ error: { code: 'stale_timestamp' } }, 401)
  }
  if (!safeEqual(expectedSignature(secret, timestamp, rawBody), signature)) {
    return json({ error: { code: 'invalid_signature' } }, 401)
  }
  return json({ ok: true, provider: 'tiktok', webhooks: 'active' })
}
