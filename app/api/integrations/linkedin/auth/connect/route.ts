import type { NextRequest } from 'next/server'
import { json, redirectTo } from '@/lib/http'
import { denyUnlessAdmin } from '@/lib/security/admin'
import { ConfigError } from '@/lib/security/secrets'
import { linkedinConfig } from '@/lib/integrations/config'
import { createOAuthCookieValue, newOAuthPending, oauthCookieName, oauthCookieOptions } from '@/lib/integrations/oauth'
import { clearAccount, loadAccount } from '@/lib/integrations/tokens'

/**
 * HUB INTÉGRATIONS — LinkedIn : initialisation du flux OAuth2 (OpenID Connect) + PKCE pour
 * la publication sur le profil et/ou la Company Page, réservé à l'espace interne.
 *
 * Scopes par défaut : w_member_social w_organization_social r_liteprofile
 * (surcharge LINKEDIN_SCOPE).
 *
 * GET    /api/integrations/linkedin/auth/connect
 *   Génère state + PKCE S256 (cookie chiffré, 10 min) et redirige vers l'autorisation LinkedIn.
 * DELETE /api/integrations/linkedin/auth/connect
 *   Déconnecte : suppression des jetons stockés (LinkedIn n'expose pas d'endpoint de
 *   révocation OAuth ; le jeton expirera d'ici 60 jours au plus tard).
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COOKIE = oauthCookieName('linkedin')

export async function GET(request: NextRequest) {
  const denied = denyUnlessAdmin(request)
  if (denied) return denied

  let authorizeUrl: string
  try {
    // Vérification du stockage AVANT l'autorisation : inutile d'obtenir des jetons qui
    // ne pourraient pas être conservés.
    await loadAccount('linkedin')
    const config = linkedinConfig()
    const pending = newOAuthPending()
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      state: pending.state,
      scope: config.scope,
      code_challenge: pending.codeChallenge,
      code_challenge_method: 'S256',
    })
    authorizeUrl = `${config.authBase}/authorization?${params.toString()}`
    const response = redirectTo(authorizeUrl, 307)
    response.cookies.set(COOKIE, createOAuthCookieValue(pending), oauthCookieOptions())
    return response
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error('[integrations:linkedin:connect]', error.message)
      return redirectTo('/connect?channel=linkedin&error=config')
    }
    console.error('[integrations:linkedin:connect]', error instanceof Error ? error.message : 'erreur inconnue')
    return redirectTo('/connect?channel=linkedin&error=storage')
  }
}

export async function DELETE(request: NextRequest) {
  const denied = denyUnlessAdmin(request)
  if (denied) return denied
  try {
    await clearAccount('linkedin')
    return json({ connected: false, provider: 'linkedin' })
  } catch (error) {
    console.error('[integrations:linkedin:connect]', error instanceof Error ? error.message : 'erreur inconnue')
    return json({ connected: false, provider: 'linkedin', error: { code: 'storage' } }, 503)
  }
}
