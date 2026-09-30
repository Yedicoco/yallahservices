import type { NextRequest } from 'next/server'
import { json } from '@/lib/http'
import { webhookEventKey } from '@/lib/integrations/tokens'
import { getStore } from '@/lib/storage/kv'

/**
 * HUB INTÉGRATIONS — LinkedIn : webhooks (Organization Webhooks de la Company Page).
 * URI à déclarer dans le gestionnaire de la Company Page (Webhooks) :
 * https://<domaine>/api/integrations/linkedin/webhooks
 *
 * Vérification : LinkedIn envoie une requête GET avec un paramètre « challenge » lors de
 * l'enregistrement du webhook ; l'URL est validée si l'endpoint renvoie ce challenge en
 * texte brut. (LinkedIn ne fournit pas de signature HMAC sur ces webhooks : la validation
 * repose sur le challenge, et chaque événement est journalisé sans action destructive.)
 *
 * Événements : « organization.updated » (changement de profil de la Page) et similaires —
 * conservés 7 jours pour consultation, sans effet sur les jetons.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EVENT_TTL_SECONDS = 7 * 24 * 3600

export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get('challenge')
  if (!challenge || challenge.length > 200) return json({ error: { code: 'challenge_missing' } }, 400)
  return new Response(challenge, {
    status: 200,
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' },
  })
}

type LinkedInWebhookEvent = { eventType?: string; organization?: unknown }

export async function POST(request: NextRequest) {
  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return json({ error: { code: 'invalid_body' } }, 400)
  }

  let event: LinkedInWebhookEvent
  try {
    event = JSON.parse(rawBody) as LinkedInWebhookEvent
  } catch {
    return json({ error: { code: 'invalid_json' } }, 400)
  }

  const eventType = typeof event.eventType === 'string' ? event.eventType : 'unknown'

  // Conservation « au mieux » : un échec de stockage ne doit pas faire rejouer l'événement.
  void getStore()
    .set(webhookEventKey('linkedin', `event:${eventType}`), rawBody, EVENT_TTL_SECONDS)
    .catch(() => undefined)

  return json({ ok: true })
}
