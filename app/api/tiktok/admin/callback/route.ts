import type { NextRequest } from 'next/server'
import { redirectTo } from '@/lib/http'
import { denyUnlessAdmin } from '@/lib/security/admin'
import { safeEqual } from '@/lib/security/compare'
import { ConfigError } from '@/lib/security/secrets'
import { accountFromToken, saveAdminAccount } from '@/lib/storage/admin-account'
import { StorageError } from '@/lib/storage/kv'
import { fetchUserInfo, type TikTokUser } from '@/lib/tiktok/api'
import { adminConfig } from '@/lib/tiktok/config'
import { ADMIN_STATE_COOKIE, expiredCookieOptions } from '@/lib/tiktok/cookies'
import { exchangeCode } from '@/lib/tiktok/oauth'

/**
 * PRODUIT 2 — Direct Post interne : retour de TikTok après autorisation du compte administrateur.
 * URI à déclarer chez TikTok : https://<domaine>/api/tiktok/admin/callback
 *
 * Contrôles : session administrateur valide (même navigateur que celui qui a lancé la connexion),
 * state identique au cookie, scope « video.publish » réellement accordé.
 * Les jetons sont chiffrés puis écrits dans le stockage durable : jamais dans un cookie.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const denied = denyUnlessAdmin(request)
  if (denied) return denied

  const params = request.nextUrl.searchParams
  const finish = (location: string) => {
    const response = redirectTo(location)
    response.cookies.set(ADMIN_STATE_COOKIE, '', expiredCookieOptions())
    return response
  }

  if (params.get('error')) {
    return finish(`/connect?error=${params.get('error') === 'access_denied' ? 'access_denied' : 'tiktok_error'}`)
  }

  const code = params.get('code')
  const state = params.get('state')
  const expectedState = request.cookies.get(ADMIN_STATE_COOKIE)?.value
  if (!code || !state || !expectedState || !safeEqual(state, expectedState)) {
    return finish('/connect?error=state_mismatch')
  }

  try {
    const token = await exchangeCode(adminConfig(), code)
    if (!(token.scope ?? '').split(',').includes('video.publish')) return finish('/connect?error=scope_missing')

    let profile: TikTokUser = {}
    try {
      profile = await fetchUserInfo(token.access_token)
    } catch {
      // le nom affiché est facultatif : la connexion reste valide sans lui
    }
    await saveAdminAccount(accountFromToken(token, { display_name: profile.display_name }))
    return finish('/connect?connected=1')
  } catch (error) {
    console.error('[tiktok:admin:callback]', error instanceof Error ? `${error.name}: ${error.message}` : 'erreur inconnue')
    const reason = error instanceof ConfigError ? 'config' : error instanceof StorageError ? 'storage' : 'token_exchange_failed'
    return finish(`/connect?error=${reason}`)
  }
}
