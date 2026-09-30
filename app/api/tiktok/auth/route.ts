import { redirectTo } from '@/lib/http'
import { SCOPE_LOGIN, loginConfig } from '@/lib/tiktok/config'
import { LOGIN_STATE_COOKIE, stateCookieOptions } from '@/lib/tiktok/cookies'
import { buildAuthorizeUrl, newState } from '@/lib/tiktok/oauth'

/**
 * PRODUIT 1 — Login Kit public (génération de leads).
 * GET /api/tiktok/auth : le visiteur est envoyé vers l'écran d'autorisation TikTok.
 * Scope demandé : « user.info.basic » uniquement (nom de profil et avatar publics).
 * Aucun lien avec le Direct Post interne (routes /api/tiktok/admin/*).
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  let authorizeUrl: string
  const state = newState()
  try {
    authorizeUrl = buildAuthorizeUrl(loginConfig(), SCOPE_LOGIN, state)
  } catch (error) {
    console.error('[tiktok:login] configuration', error instanceof Error ? error.message : 'erreur inconnue')
    return redirectTo('/?tiktok=unavailable#contact')
  }
  const response = redirectTo(authorizeUrl, 307)
  response.cookies.set(LOGIN_STATE_COOKIE, state, stateCookieOptions())
  return response
}
