import type { NextRequest } from 'next/server'
import { json, redirectTo } from '@/lib/http'
import { denyUnlessAdmin } from '@/lib/security/admin'
import { ConfigError } from '@/lib/security/secrets'
import { TIKTOK_INTEGRATION_SCOPE, tiktokIntegrationConfig } from '@/lib/integrations/config'
import {
  createOAuthCookieValue,
  newOAuthPending,
  oauthCookieName,
  oauthCookieOptions,
} from '@/lib/integrations/oauth'
import { clearAccount, loadAccount } from '@/lib/integrations/tokens'
import { buildAuthorizeUrl, revokeToken } from '@/lib/integrations/tiktok/oauth'

/**
 * HUB INTÉGRATIONS — TikTok : initialisation du flux OAuth2 + PKCE pour le compte
 * @yallah.services.m (scopes user.info.basic + video.publish), réservé à l'espace interne.
 *
 * GET    /api/integrations/tiktok/auth/connect
 *   Génère state + PKCE S256 (cookie chiffré, 10 min) et redirige vers l'autorisation TikTok.
 * DELETE /api/integrations/tiktok/auth/connect
 *   Déconnecte : révocation côté TikTok (au mieux) + suppression des jetons stockés.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COOKIE = oauthCookieName('tiktok')

export async function GET(request: NextRequest) {
  const denied = denyUnlessAdmin(request)
  if (denied) return denied

  let authorizeUrl: string
  try {
    // Vérification du stockage AVANT l'autorisation : inutile d'obtenir des jetons qui
    // ne pourraient pas être conservés.
    await loadAccount('tiktok')
    const config = tiktokIntegrationConfig()
    const pending = newOAuthPending()
    authorizeUrl = buildAuthorizeUrl(config, TIKTOK_INTEGRATION_SCOPE, pending)
    const response = redirectTo(authorizeUrl, 307)
    response.cookies.set(COOKIE, createOAuthCookieValue(pending), oauthCookieOptions())
    return response
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error('[integrations:tiktok:connect]', error.message)
      return redirectTo('/connect?channel=tiktok&error=config')
    }
    console.error('[integrations:tiktok:connect]', error instanceof Error ? error.message : 'erreur inconnue')
    return redirectTo('/connect?channel=tiktok&error=storage')
  }
}

export async function DELETE(request: NextRequest) {
  const denied = denyUnlessAdmin(request)
  if (denied) return denied
  try {
    const account = await loadAccount('tiktok')
    if (account?.accessToken) {
      try {
        await revokeToken(tiktokIntegrationConfig(), account.accessToken)
      } catch {
        // configuration absente : on supprime quand même les jetons locaux
      }
    }
    await clearAccount('tiktok')
    return json({ connected: false, provider: 'tiktok' })
  } catch (error) {
    console.error('[integrations:tiktok:connect]', error instanceof Error ? error.message : 'erreur inconnue')
    return json({ connected: false, provider: 'tiktok', error: { code: 'storage' } }, 503)
  }
}


