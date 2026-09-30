import { TikTokApiError } from '@/lib/tiktok/api'
import type { TokenResponse } from '@/lib/tiktok/oauth'
import { tiktokIntegrationConfig } from '../config'
import { refreshAccessToken } from './oauth'
import { IntegrationNotConnectedError, IntegrationReconnectError } from '../errors'
import { loadAccount, saveAccount, type IntegrationAccount } from '../tokens'

/**
 * Cycle de vie du compte TikTok du hub d'intégrations : construction du compte depuis une
 * réponse de jeton, et obtention d'un access_token valide (rafraîchi si nécessaire).
 *
 * Le raisonnement de rafraîchissement est identique au Direct Post : marge de 15 minutes,
 * repli sur le jeton actuel en cas de panne passagère, reconnexion exigée si le
 * refresh_token est consommé/expiré.
 */
const REFRESH_MARGIN_MS = 15 * 60 * 1000

export function tiktokAccountFromToken(
  token: TokenResponse,
  extra: { displayName?: string } = {},
  previous?: IntegrationAccount,
): IntegrationAccount {
  const now = Date.now()
  return {
    provider: 'tiktok',
    connectedAt: previous?.connectedAt ?? now,
    updatedAt: now,
    displayName: extra.displayName ?? previous?.displayName,
    accessToken: token.access_token,
    refreshToken: token.refresh_token ?? previous?.refreshToken,
    openId: token.open_id,
    scope: token.scope ?? previous?.scope,
    expiresAt: now + token.expires_in * 1000,
    refreshExpiresAt: token.refresh_expires_in ? now + token.refresh_expires_in * 1000 : previous?.refreshExpiresAt,
  }
}

export async function getValidTiktokAccessToken(): Promise<{ accessToken: string; account: IntegrationAccount }> {
  const account = await loadAccount('tiktok')
  if (!account || !account.accessToken) throw new IntegrationNotConnectedError('tiktok')
  if (account.expiresAt !== undefined && account.expiresAt - Date.now() > REFRESH_MARGIN_MS) {
    return { accessToken: account.accessToken, account }
  }

  const stillValid = account.expiresAt !== undefined && account.expiresAt - Date.now() > 30_000
  const refreshExpired = account.refreshExpiresAt !== undefined && account.refreshExpiresAt <= Date.now()
  if (!account.refreshToken || refreshExpired) {
    if (stillValid) return { accessToken: account.accessToken, account }
    throw new IntegrationReconnectError('tiktok')
  }

  try {
    // On rafraîchit avec les identifiants de l'application DU HUB (ceux de la connexion),
    // pas ceux du Direct Post : les jetons ne sont valables que pour l'app qui les a émis.
    const token = await refreshAccessToken(tiktokIntegrationConfig(), account.refreshToken)
    const next = tiktokAccountFromToken(token, { displayName: account.displayName }, account)
    await saveAccount(next)
    return { accessToken: next.accessToken as string, account: next }
  } catch (error) {
    // Un appel concurrent a pu rafraîchir entre-temps : on relit avant de conclure à l'échec.
    const latest = await loadAccount('tiktok').catch(() => null)
    if (latest?.accessToken && latest.accessToken !== account.accessToken && latest.expiresAt !== undefined && latest.expiresAt - Date.now() > 30_000) {
      return { accessToken: latest.accessToken, account: latest }
    }
    if (error instanceof TikTokApiError && error.code === 'invalid_grant') throw new IntegrationReconnectError('tiktok')
    // Panne passagère : tant que le jeton actuel est encore valide, on continue avec lui.
    if (stillValid) return { accessToken: account.accessToken, account }
    throw error
  }
}
