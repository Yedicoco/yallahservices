import type { NextRequest } from 'next/server'
import { json } from '@/lib/http'
import { safeEqual } from '@/lib/security/compare'
import { cronSecret, metaConfig } from '@/lib/integrations/config'
import { IntegrationReconnectError } from '@/lib/integrations/errors'
import { exchangeForLongLived } from '@/lib/integrations/meta/api'
import { getValidTiktokAccessToken } from '@/lib/integrations/tiktok/account'
import { loadAccount, saveAccount } from '@/lib/integrations/tokens'

/**
 * OPÉRATIONS — Tâche planifiée de rafraîchissement des jetons du hub d'intégrations.
 * Appelée par un planificateur externe (Vercel Cron, GitHub Actions, crontab…) en
 * GET ou POST, avec le secret CRON_SECRET (24 caractères minimum) dans l'en-tête
 * « x-cron-secret » ou « Authorization: Bearer … ». Absent, l'endpoint est désactivé (503).
 *
 * Fréquence recommandée : toutes les heures ou une fois par jour (bien avant les expirations).
 *
 * Comportement par réseau :
 *  - TikTok : access_token (24 h) rafraîchi via le refresh_token (365 j) ;
 *  - Meta : jetons long-lived (~60 j) ré-échangés dès qu'il reste moins de 7 jours,
 *    tant que l'ancien jeton est encore valide ;
 *  - LinkedIn : AUCUN refresh_token (jeton 60 j) : le rapport signale les jours restants —
 *    il faut reconnecter le compte avant expiration.
 *
 * La réponse JSON (jamais de jeton) sert de rapport d'audit pour le planificateur.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Meta : on ré-échange les jetons long-lived à partir de ce seuil. */
const META_REFRESH_BEFORE_MS = 7 * 24 * 3600 * 1000
const MIN_VALIDITY_TO_REFRESH_MS = 5 * 60 * 1000

function verifyCronSecret(request: NextRequest): boolean {
  const secret = cronSecret()
  if (!secret) return false
  const header = request.headers.get('x-cron-secret')
  const authorization = request.headers.get('authorization')
  const candidate = header ?? (authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : null)
  return candidate ? safeEqual(candidate, secret) : false
}

async function refreshTikTok(): Promise<Record<string, unknown>> {
  const before = await loadAccount('tiktok').catch(() => null)
  if (!before) return { status: 'not_connected' }
  try {
    const { account } = await getValidTiktokAccessToken()
    return {
      status: account.accessToken === before.accessToken ? 'not_due' : 'refreshed',
      expires_in_hours: Math.round(((account.expiresAt ?? Date.now()) - Date.now()) / 3_600_000),
    }
  } catch (error) {
    if (error instanceof IntegrationReconnectError) return { status: 'reconnect_required' }
    console.error('[admin:cron:refresh] tiktok', error instanceof Error ? error.message : '')
    return { status: 'error' }
  }
}

async function refreshMeta(): Promise<Record<string, unknown>> {
  const account = await loadAccount('meta').catch(() => null)
  if (!account) return { status: 'not_connected' }
  let config
  try {
    config = metaConfig()
  } catch {
    return { status: 'error', reason: 'config' }
  }
  const now = Date.now()
  const due = (expiresAt: number | undefined) =>
    expiresAt !== undefined && expiresAt - now < META_REFRESH_BEFORE_MS && expiresAt - now > MIN_VALIDITY_TO_REFRESH_MS

  let userRefreshed = false
  let pagesRefreshed = 0
  let anyError = false

  // Jeton utilisateur long-lived.
  if (account.metaUserToken && due(account.metaUserTokenExpiresAt)) {
    try {
      const grant = await exchangeForLongLived(config, account.metaUserToken)
      account.metaUserToken = grant.accessToken
      account.metaUserTokenExpiresAt = now + grant.expiresIn * 1000
      userRefreshed = true
    } catch (error) {
      anyError = true
      console.error('[admin:cron:refresh] meta user token', error instanceof Error ? error.message : '')
    }
  }

  // Jetons Pages (long-lived), un à un : une Page refusée ne bloque pas les autres.
  for (const page of account.pages ?? []) {
    if (!due(page.expiresAt)) continue
    try {
      const grant = await exchangeForLongLived(config, page.accessToken)
      page.accessToken = grant.accessToken
      page.expiresAt = now + grant.expiresIn * 1000
      pagesRefreshed += 1
    } catch (error) {
      anyError = true
      console.error(`[admin:cron:refresh] meta page ${page.pageId}`, error instanceof Error ? error.message : '')
    }
  }

  if (userRefreshed || pagesRefreshed > 0) {
    account.updatedAt = now
    try {
      await saveAccount(account)
    } catch (error) {
      anyError = true
      console.error('[admin:cron:refresh] meta save', error instanceof Error ? error.message : '')
    }
  }

  return {
    status: anyError && !userRefreshed && pagesRefreshed === 0 ? 'error' : userRefreshed || pagesRefreshed > 0 ? 'refreshed' : 'not_due',
    user_token: userRefreshed,
    pages_refreshed: pagesRefreshed,
  }
}

function linkedinReport(expiresAt: number | undefined): Record<string, unknown> {
  // LinkedIn n'émet pas de refresh_token : on signale le temps restant (reconnexion à prévoir).
  if (expiresAt === undefined) return { status: 'no_refresh' }
  const days = Math.max(0, Math.round((expiresAt - Date.now()) / 86_400_000 * 10) / 10)
  return { status: expiresAt <= Date.now() ? 'expired_reconnect' : 'no_refresh', days_remaining: days }
}

async function refreshLinkedIn(): Promise<Record<string, unknown>> {
  const account = await loadAccount('linkedin').catch(() => null)
  if (!account) return { status: 'not_connected' }
  return linkedinReport(account.expiresAt)
}

async function handle(request: NextRequest) {
  if (!cronSecret()) {
    return json({ error: { code: 'config', message: 'CRON_SECRET est absent ou trop court (24 caractères minimum).' } }, 503)
  }
  if (!verifyCronSecret(request)) return json({ error: { code: 'unauthorized' } }, 401)

  const results: Record<string, unknown> = {
    tiktok: await refreshTikTok(),
    meta: await refreshMeta(),
    linkedin: await refreshLinkedIn(),
  }
  const ok = Object.values(results).every((result) => (result as { status: string }).status !== 'error')
  return json({ ok, at: new Date().toISOString(), results })
}

export async function GET(request: NextRequest) {
  return handle(request)
}

export async function POST(request: NextRequest) {
  return handle(request)
}
