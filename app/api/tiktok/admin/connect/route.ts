import type { NextRequest } from 'next/server'
import { json, redirectTo } from '@/lib/http'
import { denyUnlessAdmin } from '@/lib/security/admin'
import { clearAdminAccount, loadAdminAccount } from '@/lib/storage/admin-account'
import { getStore } from '@/lib/storage/kv'
import { adminErrorResponse } from '@/lib/tiktok/admin-response'
import { SCOPE_DIRECT_POST, adminConfig } from '@/lib/tiktok/config'
import { ADMIN_STATE_COOKIE, stateCookieOptions } from '@/lib/tiktok/cookies'
import { buildAuthorizeUrl, newState, revokeToken } from '@/lib/tiktok/oauth'

/**
 * PRODUIT 2 — Direct Post interne : connexion du compte @yallah.services.m.
 * Réservé à l'administrateur (404 pour tout autre appelant).
 *
 * GET    /api/tiktok/admin/connect → redirige vers l'autorisation TikTok (user.info.basic + video.publish)
 * DELETE /api/tiktok/admin/connect → déconnecte le compte (révocation TikTok + suppression des jetons stockés)
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const denied = denyUnlessAdmin(request)
  if (denied) return denied

  const state = newState()
  let authorizeUrl: string
  try {
    const config = adminConfig()
    // On vérifie le stockage AVANT d'envoyer l'administrateur chez TikTok : inutile d'obtenir
    // une autorisation dont les jetons ne pourraient pas être conservés.
    getStore()
    authorizeUrl = buildAuthorizeUrl(config, SCOPE_DIRECT_POST, state)
  } catch (error) {
    console.error('[tiktok:admin:connect]', error instanceof Error ? error.message : 'erreur inconnue')
    return redirectTo('/connect?error=config')
  }
  const response = redirectTo(authorizeUrl, 307)
  response.cookies.set(ADMIN_STATE_COOKIE, state, stateCookieOptions())
  return response
}

export async function DELETE(request: NextRequest) {
  const denied = denyUnlessAdmin(request)
  if (denied) return denied
  try {
    const account = await loadAdminAccount()
    if (account) {
      try {
        await revokeToken(adminConfig(), account.access_token)
      } catch {
        // configuration absente : on supprime quand même les jetons locaux
      }
    }
    await clearAdminAccount()
    return json({ connected: false })
  } catch (error) {
    return adminErrorResponse(error)
  }
}
