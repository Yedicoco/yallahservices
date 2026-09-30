import type { NextRequest } from 'next/server'
import { json } from '@/lib/http'
import { denyUnlessAdmin } from '@/lib/security/admin'
import { ConfigError } from '@/lib/security/secrets'
import { fetchUserInfo as probeTikTok, type TikTokUser } from '@/lib/tiktok/api'
import { fetchMe as probeMeta } from '@/lib/integrations/meta/api'
import { fetchUserInfo as probeLinkedIn } from '@/lib/integrations/linkedin/api'
import { INTEGRATIONS, isIntegrationConfigured, linkedinConfig, metaConfig, type Integration } from '@/lib/integrations/config'
import { loadAccount, type IntegrationAccount } from '@/lib/integrations/tokens'
import { getStore } from '@/lib/storage/kv'

/**
 * OPÉRATIONS — État du hub d'intégrations : stockage durable, configuration et jetons de
 * chaque réseau, plus une sonde (best effort) d'accessibilité de l'API de chaque réseau
 * connecté. Réservé à l'administrateur (404 neutre sinon) ; aucun jeton n'est renvoyé.
 *
 * GET /api/admin/system/health
 *   → { ok, storage, integrations: { tiktok|meta|linkedin: { configured, status, … } }, probes }
 *
 * status : not_configured | not_connected | ok | expiring_soon (jeton < 30 min) | expired.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EXPIRING_SOON_MS = 30 * 60 * 1000

type TokenStatus = 'ok' | 'expiring_soon' | 'expired'

function accessStatus(account: IntegrationAccount): TokenStatus {
  const expiresAt =
    account.provider === 'meta'
      ? account.metaUserTokenExpiresAt
      : account.expiresAt
  if (expiresAt === undefined) return 'ok'
  const remaining = expiresAt - Date.now()
  if (remaining <= 0) {
    // Un refresh encore valide (TikTok / Meta) permet de se sortir de là ; sans lui, c'est fini.
    const refreshExpiresAt = account.refreshExpiresAt
    return account.provider === 'linkedin' || refreshExpiresAt === undefined || refreshExpiresAt <= Date.now()
      ? 'expired'
      : 'expiring_soon'
  }
  return remaining < EXPIRING_SOON_MS ? 'expiring_soon' : 'ok'
}

async function probeProvider(provider: Integration, account: IntegrationAccount): Promise<'ok' | 'unreachable' | 'skipped'> {
  const call = () => {
    if (provider === 'tiktok') {
      if (!account.accessToken || account.expiresAt === undefined || account.expiresAt <= Date.now()) return null
      return probeTikTok(account.accessToken).then((user: TikTokUser) => user)
    }
    if (provider === 'meta') {
      if (!account.metaUserToken || account.metaUserTokenExpiresAt === undefined || account.metaUserTokenExpiresAt <= Date.now()) return null
      return probeMeta(metaConfig(), account.metaUserToken)
    }
    if (!account.accessToken || account.expiresAt === undefined || account.expiresAt <= Date.now()) return null
    return probeLinkedIn(linkedinConfig(), account.accessToken)
  }
  try {
    const result = await call()
    return result === null ? 'skipped' : 'ok'
  } catch {
    return 'unreachable'
  }
}

export async function GET(request: NextRequest) {
  const denied = denyUnlessAdmin(request)
  if (denied) return denied

  // 1) Stockage durable : aller-retour écriture/lecture sur une clé éphémère.
  const storage: { ok: boolean; kind?: string; detail?: string } = { ok: false }
  try {
    const store = getStore()
    const pingKey = 'yallah:health:ping'
    await store.set(pingKey, 'ping', 60)
    const read = await store.get(pingKey)
    await store.del(pingKey)
    storage.ok = read === 'ping'
    storage.kind = store.kind
    if (!storage.ok) storage.detail = 'aller-retour échoué'
  } catch (error) {
    storage.detail = error instanceof Error ? error.message : 'erreur inconnue'
  }

  // 2) Configuration + jetons de chaque réseau (lecture seule, sans rafraîchissement).
  const integrations: Record<string, unknown> = {}
  const accounts = new Map<Integration, IntegrationAccount>()
  for (const provider of INTEGRATIONS) {
    const configured = isIntegrationConfigured(provider)
    const account = configured ? await loadAccount(provider).catch(() => null) : null
    if (account) accounts.set(provider, account)
    if (!configured) {
      integrations[provider] = { configured: false, status: 'not_configured' }
      continue
    }
    if (!account) {
      integrations[provider] = { configured: true, status: 'not_connected' }
      continue
    }
    integrations[provider] = {
      configured: true,
      status: accessStatus(account),
      display_name: account.displayName ?? null,
      connected_at: account.connectedAt,
      expires_at: account.provider === 'meta' ? account.metaUserTokenExpiresAt ?? null : account.expiresAt ?? null,
      refresh_expires_at: account.refreshExpiresAt ?? null,
      pages: account.pages?.map((page) => ({ id: page.pageId, name: page.pageName ?? null, instagram: page.instagramId ? true : false })) ?? null,
    }
  }

  // 3) Sonde d'accessibilité des API (en parallèle, jamais bloquante).
  const probes: Record<string, 'ok' | 'unreachable' | 'skipped'> = {}
  await Promise.all(
    [...accounts.entries()].map(async ([provider, account]) => {
      probes[provider] = await probeProvider(provider, account)
    }),
  )

  const anyExpired = INTEGRATIONS.some((provider) => (integrations[provider] as { status: string }).status === 'expired')
  return json({ ok: storage.ok && !anyExpired, checked_at: new Date().toISOString(), storage, integrations, probes })
}
