import { createHmac } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { json } from '@/lib/http'
import { safeEqual } from '@/lib/security/compare'
import { ConfigError } from '@/lib/security/secrets'
import { metaConfig, metaWebhookSecret } from '@/lib/integrations/config'
import { clearAccount, loadAccount } from '@/lib/integrations/tokens'
import { revokeToken } from '@/lib/integrations/meta/api'

/**
 * HUB INTÉGRATIONS — Meta : callback légal de suppression des données (RGPD).
 * URI à déclarer dans le dashboard de l'application Meta (section « Webhooks » → URL de
 * suppression, exigée pour l'advanced access) :
 * https://<domaine>/api/integrations/meta/webhooks/deletion
 *
 * Quand un utilisateur demande la suppression de ses données d'application, Meta appelle
 * cette adresse avec son identifiant. Traitement :
 *  - l'identifiant est extraite (JSON documenté { object: « deletion », data: [{ id }] },
 *    ou identifiant numérique seul) ;
 *  - S'IL correspond au compte Meta connecté, les jetons stockés sont révoqués (au mieux)
 *    puis supprimés : l'entreprise ne conserve aucune donnée permettant de retrouver la
 *    personne via l'application ;
 *  - sinon (utilisateur inconnu) : accusé de réception silencieux — l'opération est idempotente.
 *  - chaque demande est journalisée (audit RGPD) SANS jamais écrire de jeton.
 *
 * Sécurité : signature X-Hub-Signature-256 (HMAC-SHA256 du corps brut, app secret) vérifiée
 * en temps constant dès que l'en-tête est présent.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let secret: string
  try {
    secret = metaWebhookSecret(metaConfig()) as string
  } catch (error) {
    if (error instanceof ConfigError) return json({ error: { code: 'config' } }, 503)
    throw error
  }

  const rawBody = await request.text()

  const signatureHeader = request.headers.get('x-hub-signature-256')
  if (signatureHeader !== null) {
    const match = signatureHeader.match(/^sha256=([0-9a-f]+)$/i)
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
    if (!match || !safeEqual(expected, match[1])) return json({ error: { code: 'invalid_signature' } }, 401)
  }

  // Extraction de l'identifiant utilisateur (plusieurs formes documentées/observées).
  let userId: string | null = null
  const trimmed = rawBody.trim()
  if (/^\d{5,25}$/.test(trimmed)) {
    userId = trimmed
  } else if (trimmed) {
    try {
      const body = JSON.parse(trimmed) as { object?: unknown; data?: unknown; id?: unknown }
      if (body && body.object === 'deletion') {
        const first = Array.isArray(body.data) ? body.data[0] : body.data
        const id = (first as { id?: unknown } | undefined)?.id ?? body.id
        if (typeof id === 'string' && /^\d+$/.test(id)) userId = id
        else if (typeof id === 'number' && Number.isInteger(id)) userId = String(id)
      }
    } catch {
      // corps non JSON non numérique : ininterprétable
    }
  }

  // Audit RGPD : toute demande est tracée (identifiant seulement, jamais de jeton).
  console.info('[integrations:meta:deletion] demande de suppression reçue', { user_id: userId ?? 'inconnu' })

  if (!userId) return json({ ok: true })

  const account = await loadAccount('meta').catch(() => null)
  if (account && account.metaUserId === userId) {
    try {
      if (account.metaUserToken) await revokeToken(metaConfig(), account.metaUserToken)
    } catch {
      // révocation « au mieux » : la suppression locale doit avoir lieu quoi qu'il arrive
    }
    try {
      await clearAccount('meta')
      console.info('[integrations:meta:deletion] compte Meta supprimé (données purgeées)')
    } catch (error) {
      console.error('[integrations:meta:deletion] suppression impossible', error instanceof Error ? error.message : '')
      return json({ error: { code: 'storage' } }, 503)
    }
  }

  // Réponse 200 systématique : Meta ne rejoue pas une suppression.
  return json({ ok: true })
}
