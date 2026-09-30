import { seal, unseal } from '@/lib/security/seal'
import { sessionSecret } from '@/lib/security/secrets'
import { getStore } from '@/lib/storage/kv'
import type { Integration } from './config'

/**
 * Comptes d'intégration (un par réseau) utilisés par le hub de publication multi-réseaux.
 *
 * Mêmes garanties que le Direct Post : jetons chiffrés (AES-256-GCM, purpose dédié) avant
 * écriture dans le stockage durable ; jamais dans un cookie, jamais dans les journaux.
 * Un TTL est posé sur la clé, calé sur l'expiration du dernier jeton (marge de 7 jours) :
 * un compte totalement expiré se nettoie de lui-même sans bloquer la base.
 */
const PURPOSE = 'integration-token-store/v1'

export type MetaPageAccount = {
  pageId: string
  pageName?: string
  /** Jeton Page (long-lived, ~60 jours, renouvelable par échange). */
  accessToken: string
  expiresAt?: number
  /** Compte Instagram Business rattaché à la Page (scope instagram_basic). */
  instagramId?: string
  instagramUsername?: string
}

export type IntegrationAccount = {
  provider: Integration
  /** Horodatages en millisecondes (epoch). */
  connectedAt: number
  updatedAt: number
  displayName?: string

  // ── TikTok ──
  /** access_token (24 h) et refresh_token (365 jours). */
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
  refreshExpiresAt?: number
  openId?: string
  scope?: string

  // ── Meta ──
  /** Identifiant chiffré de l'utilisateur Meta qui a connecté (callback de suppression RGPD). */
  metaUserId?: string
  /** Jeton utilisateur long-lived (~60 jours, renouvelable par échange). */
  metaUserToken?: string
  metaUserTokenExpiresAt?: number
  /** Pages connectées, chacune avec son propre jeton long-lived. */
  pages?: MetaPageAccount[]

  // ── LinkedIn ──
  /** sub (OpenID) de l'utilisateur. */
  linkedinSub?: string
}

function storeKey(provider: Integration): string {
  return `yallah:integration:${provider}:account:v1`
}

/** Plus lointaine date d'expiration du compte (marge incluse pour le TTL). */
function expiryHorizonMs(account: IntegrationAccount): number | undefined {
  const candidates = [
    account.expiresAt,
    account.refreshExpiresAt,
    account.metaUserTokenExpiresAt,
    ...(account.pages ?? []).map((page) => page.expiresAt),
  ].filter((value): value is number => typeof value === 'number')
  if (candidates.length === 0) return undefined
  return Math.max(...candidates)
}

export async function saveAccount(account: IntegrationAccount): Promise<void> {
  const horizon = expiryHorizonMs(account)
  // Marge de 7 jours : le compte reste consultable (et ré-échangé) quelques jours avant la
  // fin de validité réelle du dernier jeton.
  const ttl = horizon === undefined ? undefined : Math.ceil((horizon - Date.now()) / 1000) + 7 * 24 * 3600
  await getStore().set(storeKey(account.provider), seal(account, sessionSecret(), PURPOSE), ttl)
}

export async function loadAccount(provider: Integration): Promise<IntegrationAccount | null> {
  const value = await getStore().get(storeKey(provider))
  const account = unseal<IntegrationAccount>(value, sessionSecret(), PURPOSE)
  if (!account || account.provider !== provider) return null
  return account
}

export async function clearAccount(provider: Integration): Promise<void> {
  await getStore().del(storeKey(provider))
}

/** Tous les comptes existants (health, cron). */
export async function listAccounts(): Promise<IntegrationAccount[]> {
  const accounts: IntegrationAccount[] = []
  for (const provider of ['tiktok', 'meta', 'linkedin'] as const) {
    const account = await loadAccount(provider).catch(() => null)
    if (account) accounts.push(account)
  }
  return accounts
}

/** Clé de stockage des derniers événements webhook (statuts de publication, etc.). */
export function webhookEventKey(provider: Integration, subject: string): string {
  return `yallah:integration:${provider}:event:${subject.slice(0, 120)}`
}
