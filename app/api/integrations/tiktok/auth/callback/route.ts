import type { NextRequest } from 'next/server'
import { redirectTo } from '@/lib/http'
import { denyUnlessAdmin } from '@/lib/security/admin'
import { safeEqual } from '@/lib/security/compare'
import { ConfigError } from '@/lib/security/secrets'
import { StorageError } from '@/lib/storage/kv'
import { fetchUserInfo } from '@/lib/tiktok/api'
import { TIKTOK_INTEGRATION_SCOPE, tiktokIntegrationConfig } from '@/lib/integrations/config'
import { expiredOAuthCookieOptions, oauthCookieName, readOAuthCookieValue } from '@/lib/integrations/oauth'
import { saveAccount } from '@/lib/integrations/tokens'
import { tiktokAccountFromToken } from '@/lib/integrations/tiktok/account'
import { exchangeCode } from '@/lib/integrations/tiktok/oauth'

/**
 * HUB INTÉGRATIONS — TikTok : retour du flux OAuth2 + PKCE.
 * URI à déclarer chez TikTok : https://<domaine>/api/integrations/tiktok/auth/callback
 *
 * Contrôles : session administrateur (même navigateur que la connexion), state identique au
 * cookie chiffré, scope « video.publish » réellement accordé. Les jetons (24 h + refresh 365 j)
 * sont chiffrés puis écrits dans le stockage durable — jamais dans un cookie.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COOKIE = oauthCookieName('tiktok')

export async function GET(request: NextRequest) {
  const denied = denyUnlessAdmin(request)
  if (denied) return denied

  const params = request.nextUrl.searchParams
  const finish = (location: string) => {
    const response = redirectTo(location)
    response.cookies.set(COOKIE, '', expiredOAuthCookieOptions())
    return response
  }

  if (params.get('error')) {
    return finish(`/connect?channel=tiktok&error=${params.get('error') === 'access_denied' ? 'access_denied' : 'tiktok_error'}`)
  }

  const code = params.get('code')
  const state = params.get('state')
  const pending = readOAuthCookieValue(request.cookies.get(COOKIE)?.value)
  if (!code || !state || !pending || !safeEqual(state, pending.state)) {
    return finish('/connect?channel=tiktok&error=state_mismatch')
  }

  try {
    const config = tiktokIntegrationConfig()
    const token = await exchangeCode(config, code, pending.codeVerifier)
    const granted = (token.scope ?? '').split(',').map((part) => part.trim())
    for (const required of TIKTOK_INTEGRATION_SCOPE.split(',')) {
      if (!granted.includes(required)) return finish('/connect?channel=tiktok&error=scope_missing')
    }

    let displayName: string | undefined
    try {
      const profile = await fetchUserInfo(token.access_token)
      displayName = profile.display_name?.trim() || undefined
    } catch {
      // le nom affiché est facultatif : la connexion reste valide sans lui
    }

    await saveAccount(tiktokAccountFromToken(token, { displayName }))
    return finish('/connect?channel=tiktok&connected=1')
  } catch (error) {
    console.error('[integrations:tiktok:callback]', error instanceof Error ? `${error.name}: ${error.message}` : 'erreur inconnue')
    const reason =
      error instanceof ConfigError ? 'config' : error instanceof StorageError ? 'storage' : 'token_exchange_failed'
    return finish(`/connect?channel=tiktok&error=${reason}`)
  }
}
