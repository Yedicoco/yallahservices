import type { NextRequest } from 'next/server'
import { redirectTo } from '@/lib/http'
import { safeEqual } from '@/lib/security/compare'
import { VISITOR_COOKIE, createVisitorSession, visitorCookieOptions } from '@/lib/security/visitor'
import { fetchUserInfo, type TikTokUser } from '@/lib/tiktok/api'
import { loginConfig } from '@/lib/tiktok/config'
import { LOGIN_STATE_COOKIE, expiredCookieOptions } from '@/lib/tiktok/cookies'
import { exchangeCode, revokeToken } from '@/lib/tiktok/oauth'

/**
 * PRODUIT 1 — Login Kit public : retour de TikTok.
 * URI à déclarer chez TikTok : https://<domaine>/api/tiktok/auth/callback
 * (les anciens alias /api/auth/callback et /api/tiktok/callback y sont réécrits, cf. next.config.mjs).
 *
 * Déroulé : contrôle du state → échange du code → lecture du profil public → révocation du jeton
 * → cookie de session chiffré (nom + avatar) → retour sur le formulaire de contact.
 * Le jeton d'accès du visiteur n'est jamais conservé.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams

  const finish = (location: string, session?: string) => {
    const response = redirectTo(location)
    response.cookies.set(LOGIN_STATE_COOKIE, '', expiredCookieOptions())
    if (session) response.cookies.set(VISITOR_COOKIE, session, visitorCookieOptions())
    return response
  }

  // Refus ou annulation côté TikTok.
  if (params.get('error')) return finish('/?tiktok=denied#contact')

  const code = params.get('code')
  const state = params.get('state')
  const expectedState = request.cookies.get(LOGIN_STATE_COOKIE)?.value
  if (!code || !state || !expectedState || !safeEqual(state, expectedState)) {
    return finish('/?tiktok=error#contact')
  }

  try {
    const config = loginConfig()
    const token = await exchangeCode(config, code)
    let profile: TikTokUser
    try {
      profile = await fetchUserInfo(token.access_token)
    } finally {
      // Le jeton ne sert qu'à lire le profil : on le révoque immédiatement, qu'il ait servi ou non.
      await revokeToken(config, token.access_token)
    }

    const displayName = (profile.display_name ?? '').trim().slice(0, 60)
    if (!displayName) return finish('/?tiktok=error#contact')
    const avatarUrl = typeof profile.avatar_url === 'string' && profile.avatar_url.startsWith('https://') ? profile.avatar_url : undefined

    return finish('/?tiktok=connected#contact', createVisitorSession({ display_name: displayName, avatar_url: avatarUrl }))
  } catch (error) {
    console.error('[tiktok:login:callback]', error instanceof Error ? `${error.name}: ${error.message}` : 'erreur inconnue')
    return finish('/?tiktok=error#contact')
  }
}
