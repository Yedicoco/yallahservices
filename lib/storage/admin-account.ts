import { seal, unseal } from '@/lib/security/seal'
import { sessionSecret } from '@/lib/security/secrets'
import { TikTokApiError } from '@/lib/tiktok/api'
import { adminConfig } from '@/lib/tiktok/config'
import { refreshAccessToken, type TokenResponse } from '@/lib/tiktok/oauth'
import { getStore } from './kv'

/**
 * Compte TikTok administrateur (@yallah.services.m) utilisé par le Direct Post.
 *
 * Les jetons sont chiffrés (AES-256-GCM) avant d'être écrits dans le stockage durable, et
 * rafraîchis automatiquement : l'administrateur n'a pas à se reconnecter chaque jour
 * (jeton d'accès : 24 h, jeton de rafraîchissement : 365 jours).
 */
const STORE_KEY = 'yallah:tiktok:admin-account:v1'
const PURPOSE = 'token-store/v1'
/** TikTok recommande de rafraîchir 10 à 30 minutes avant l'expiration. */
const REFRESH_MARGIN_MS = 15 * 60 * 1000

export type AdminAccount = {
  open_id: string
  access_token: string
  refresh_token?: string
  scope?: string
  /** Horodatages en millisecondes (epoch). */
  expires_at: number
  refresh_expires_at?: number
  connected_at: number
  display_name?: string
}

/** Aucun compte n'est connecté. */
export class NotConnectedError extends Error {
  constructor() {
    super('Aucun compte TikTok connecté.')
    this.name = 'NotConnectedError'
  }
}

/** Le compte est connu mais l'autorisation n'est plus exploitable : il faut se reconnecter. */
export class ReconnectRequiredError extends Error {
  constructor(message = 'La session TikTok a expiré : reconnectez le compte.') {
    super(message)
    this.name = 'ReconnectRequiredError'
  }
}

export function accountFromToken(token: TokenResponse, extra: { display_name?: string } = {}, previous?: AdminAccount): AdminAccount {
  const now = Date.now()
  return {
    open_id: token.open_id,
    access_token: token.access_token,
    refresh_token: token.refresh_token ?? previous?.refresh_token,
    scope: token.scope ?? previous?.scope,
    expires_at: now + token.expires_in * 1000,
    refresh_expires_at: token.refresh_expires_in ? now + token.refresh_expires_in * 1000 : previous?.refresh_expires_at,
    connected_at: previous?.connected_at ?? now,
    display_name: extra.display_name ?? previous?.display_name,
  }
}

export async function saveAdminAccount(account: AdminAccount): Promise<void> {
  const ttl = account.refresh_expires_at ? Math.ceil((account.refresh_expires_at - Date.now()) / 1000) : undefined
  await getStore().set(STORE_KEY, seal(account, sessionSecret(), PURPOSE), ttl)
}

export async function loadAdminAccount(): Promise<AdminAccount | null> {
  const value = await getStore().get(STORE_KEY)
  return unseal<AdminAccount>(value, sessionSecret(), PURPOSE)
}

export async function clearAdminAccount(): Promise<void> {
  await getStore().del(STORE_KEY)
}

/**
 * Retourne un jeton d'accès valide, en le rafraîchissant si nécessaire.
 * Le nouveau refresh_token éventuellement renvoyé par TikTok remplace toujours l'ancien.
 */
export async function getValidAdminAccessToken(): Promise<{ accessToken: string; account: AdminAccount }> {
  const account = await loadAdminAccount()
  if (!account) throw new NotConnectedError()
  if (account.expires_at - Date.now() > REFRESH_MARGIN_MS) return { accessToken: account.access_token, account }

  const stillValid = account.expires_at - Date.now() > 30_000
  const refreshExpired = account.refresh_expires_at !== undefined && account.refresh_expires_at <= Date.now()
  if (!account.refresh_token || refreshExpired) {
    if (stillValid) return { accessToken: account.access_token, account }
    throw new ReconnectRequiredError()
  }

  try {
    const token = await refreshAccessToken(adminConfig(), account.refresh_token)
    const next = accountFromToken(token, {}, account)
    await saveAdminAccount(next)
    return { accessToken: next.access_token, account: next }
  } catch (error) {
    // Un appel concurrent a pu rafraîchir entre-temps : on relit avant de conclure à l'échec.
    const latest = await loadAdminAccount().catch(() => null)
    if (latest && latest.access_token !== account.access_token && latest.expires_at - Date.now() > 30_000) {
      return { accessToken: latest.access_token, account: latest }
    }
    if (error instanceof TikTokApiError && error.code === 'invalid_grant') throw new ReconnectRequiredError()
    // Panne passagère : tant que le jeton actuel est encore valide, on continue avec lui.
    if (stillValid) return { accessToken: account.access_token, account }
    throw error
  }
}
