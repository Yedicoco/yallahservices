import type { NextRequest } from 'next/server'
import { redirectTo } from '@/lib/http'
import { denyUnlessAdmin } from '@/lib/security/admin'
import { safeEqual } from '@/lib/security/compare'
import { ConfigError } from '@/lib/security/secrets'
import { StorageError } from '@/lib/storage/kv'
import { linkedinConfig } from '@/lib/integrations/config'
import { expiredOAuthCookieOptions, oauthCookieName, readOAuthCookieValue } from '@/lib/integrations/oauth'
import { saveAccount, type IntegrationAccount } from '@/lib/integrations/tokens'
import { exchangeCode, fetchUserInfo } from '@/lib/integrations/linkedin/api'

/**
 * HUB INTÉGRATIONS — LinkedIn : retour du flux OAuth2 + PKCE.
 * URI à déclarer dans l'application LinkedIn : https://<domaine>/api/integrations/linkedin/auth/callback
 *
 * Contrôles : session administrateur, state identique au cookie chiffré, échange du code
 * avec le code_verifier. Le jeton LinkedIn est valable 60 jours SANS refresh_token : c'est
 * le cron système qui signale l'approche de l'expiration (reconnexion nécessaire).
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COOKIE = oauthCookieName('linkedin')

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
    return finish(`/connect?channel=linkedin&error=${params.get('error') === 'access_denied' ? 'access_denied' : 'linkedin_error'}`)
  }

  const code = params.get('code')
  const state = params.get('state')
  const pending = readOAuthCookieValue(request.cookies.get(COOKIE)?.value)
  if (!code || !state || !pending || !safeEqual(state, pending.state)) {
    return finish('/connect?channel=linkedin&error=state_mismatch')
  }

  try {
    const config = linkedinConfig()
    const token = await exchangeCode(config, code, pending.codeVerifier)

    let profile: { sub: string; name?: string; given_name?: string; family_name?: string } | null = null
    try {
      profile = await fetchUserInfo(config, token.accessToken)
    } catch {
      // le profil est facultatif : la connexion reste valide sans lui
    }
    const displayName =
      profile?.name?.trim() ||
      ([profile?.given_name, profile?.family_name].filter(Boolean).join(' ').trim() || undefined)

    const account: IntegrationAccount = {
      provider: 'linkedin',
      connectedAt: Date.now(),
      updatedAt: Date.now(),
      displayName,
      linkedinSub: profile?.sub,
      accessToken: token.accessToken,
      expiresAt: Date.now() + token.expiresIn * 1000,
      scope: token.scope,
    }
    await saveAccount(account)
    return finish('/connect?channel=linkedin&connected=1')
  } catch (error) {
    console.error('[integrations:linkedin:callback]', error instanceof Error ? `${error.name}: ${error.message}` : 'erreur inconnue')
    const reason =
      error instanceof ConfigError ? 'config' : error instanceof StorageError ? 'storage' : 'token_exchange_failed'
    return finish(`/connect?channel=linkedin&error=${reason}`)
  }
}
