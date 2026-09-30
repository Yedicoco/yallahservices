import type { NextRequest } from 'next/server'
import { json, redirectTo } from '@/lib/http'
import { denyUnlessAdmin } from '@/lib/security/admin'
import { ConfigError } from '@/lib/security/secrets'
import { metaConfig } from '@/lib/integrations/config'
import { createOAuthCookieValue, newOAuthPending, oauthCookieName, oauthCookieOptions } from '@/lib/integrations/oauth'
import { clearAccount, loadAccount } from '@/lib/integrations/tokens'
import { revokeToken } from '@/lib/integrations/meta/api'

/**
 * HUB INTÉGRATIONS — Meta : Login Facebook (Business SDK) pour l'auto-publication sur les
 * Pages et Instagram Reels, réservé à l'espace interne.
 *
 * Scopes par défaut : pages_show_list, pages_manage_posts, pages_read_engagement,
 * instagram_basic, instagram_content_publish (surcharge META_SCOPE).
 *
 * GET    /api/integrations/meta/auth/connect
 *   Génère state + PKCE S256 (cookie chiffré, 10 min) et redirige vers l'autorisation Meta.
 * DELETE /api/integrations/meta/auth/connect
 *   Déconnecte : révocation du jeton utilisateur (au mieux) + suppression des jetons stockés.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COOKIE = oauthCookieName('meta')

export async function GET(request: NextRequest) {
  const denied = denyUnlessAdmin(request)
  if (denied) return denied

  let authorizeUrl: string
  try {
    // Vérification du stockage AVANT l'autorisation : inutile d'obtenir des jetons qui
    // ne pourraient pas être conservés.
    await loadAccount('meta')
    const config = metaConfig()
    const pending = newOAuthPending()
    const params = new URLSearchParams({
      client_id: config.appId,
      redirect_uri: config.redirectUri,
      state: pending.state,
      response_type: 'code',
      scope: config.scope,
      code_challenge: pending.codeChallenge,
      code_challenge_method: 'S256',
    })
    authorizeUrl = `${config.graphBase}/${config.apiVersion}/dialog/oauth?${params.toString()}`
    const response = redirectTo(authorizeUrl, 307)
    response.cookies.set(COOKIE, createOAuthCookieValue(pending), oauthCookieOptions())
    return response
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error('[integrations:meta:connect]', error.message)
      return redirectTo('/connect?channel=meta&error=config')
    }
    console.error('[integrations:meta:connect]', error instanceof Error ? error.message : 'erreur inconnue')
    return redirectTo('/connect?channel=meta&error=storage')
  }
}

export async function DELETE(request: NextRequest) {
  const denied = denyUnlessAdmin(request)
  if (denied) return denied
  try {
    const account = await loadAccount('meta')
    if (account?.metaUserToken) {
      try {
        await revokeToken(metaConfig(), account.metaUserToken)
      } catch {
        // configuration absente : on supprime quand même les jetons locaux
      }
    }
    await clearAccount('meta')
    return json({ connected: false, provider: 'meta' })
  } catch (error) {
    console.error('[integrations:meta:connect]', error instanceof Error ? error.message : 'erreur inconnue')
    return json({ connected: false, provider: 'meta', error: { code: 'storage' } }, 503)
  }
}
