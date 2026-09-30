import type { NextRequest } from 'next/server'
import { redirectTo } from '@/lib/http'
import { denyUnlessAdmin } from '@/lib/security/admin'
import { safeEqual } from '@/lib/security/compare'
import { ConfigError } from '@/lib/security/secrets'
import { StorageError } from '@/lib/storage/kv'
import { metaConfig } from '@/lib/integrations/config'
import { expiredOAuthCookieOptions, oauthCookieName, readOAuthCookieValue } from '@/lib/integrations/oauth'
import { saveAccount, type IntegrationAccount, type MetaPageAccount } from '@/lib/integrations/tokens'
import {
  exchangeCode,
  exchangeForLongLived,
  fetchMe,
  instagramBusinessAccount,
  listManagedPages,
} from '@/lib/integrations/meta/api'

/**
 * HUB INTÉGRATIONS — Meta : retour du Login Facebook après autorisation.
 * URI à déclarer dans l'application Meta : https://<domaine>/api/integrations/meta/auth/callback
 *
 * Déroulé (chaque étape échoue proprement si Meta refuse) :
 *  1. contrôle du state (cookie chiffré) + échange du code (PKCE) → jeton utilisateur COURT ;
 *  2. échange contre le jeton utilisateur LONG-LIVED (~60 j, renouvelable) ;
 *  3. lecture des Pages administrables + échange de chaque jeton Page en long-lived ;
 *  4. rattachement éventuel du compte Instagram Business de chaque Page ;
 *  5. jetons chiffrés dans le stockage durable (l'identité utilisateur Meta est conservée
 *     pour le callback légal de suppression RGPD, cf. /api/integrations/meta/webhooks/deletion).
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COOKIE = oauthCookieName('meta')

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
    return finish(`/connect?channel=meta&error=${params.get('error') === 'access_denied' ? 'access_denied' : 'meta_error'}`)
  }

  const code = params.get('code')
  const state = params.get('state')
  const pending = readOAuthCookieValue(request.cookies.get(COOKIE)?.value)
  if (!code || !state || !pending || !safeEqual(state, pending.state)) {
    return finish('/connect?channel=meta&error=state_mismatch')
  }

  try {
    const config = metaConfig()
    const shortLived = await exchangeCode(config, code, pending.codeVerifier)
    const userGrant = await exchangeForLongLived(config, shortLived.accessToken)

    let identity: { id: string; name?: string }
    try {
      identity = await fetchMe(config, userGrant.accessToken)
    } catch {
      // l'identité n'est pas bloquante : sans elle le callback RGPD sera inactif
      identity = { id: '' }
    }

    const pages: MetaPageAccount[] = []
    const rawPages = await listManagedPages(config, userGrant.accessToken)
    for (const page of rawPages) {
      if (!page.access_token) continue // scope pages_show_list non accordé : pas de jeton à échanger
      try {
        const pageGrant = await exchangeForLongLived(config, page.access_token)
        const entry: MetaPageAccount = {
          pageId: page.id,
          pageName: page.name,
          accessToken: pageGrant.accessToken,
          expiresAt: Date.now() + pageGrant.expiresIn * 1000,
        }
        try {
          const instagram = await instagramBusinessAccount(config, pageGrant.accessToken, page.id)
          if (instagram) {
            entry.instagramId = instagram.id
            entry.instagramUsername = instagram.username
          }
        } catch {
          // Page sans Instagram Business : on la conserve pour Facebook
        }
        pages.push(entry)
      } catch {
        // Une Page refusée (permissions insuffisantes) ne doit pas bloquer les autres.
      }
    }

    const account: IntegrationAccount = {
      provider: 'meta',
      connectedAt: Date.now(),
      updatedAt: Date.now(),
      displayName: identity.name?.trim() || undefined,
      metaUserId: identity.id || undefined,
      metaUserToken: userGrant.accessToken,
      metaUserTokenExpiresAt: Date.now() + userGrant.expiresIn * 1000,
      pages,
    }
    await saveAccount(account)

    const igCount = pages.filter((page) => page.instagramId).length
    return finish(`/connect?channel=meta&connected=1&pages=${pages.length}&instagram=${igCount}`)
  } catch (error) {
    console.error('[integrations:meta:callback]', error instanceof Error ? `${error.name}: ${error.message}` : 'erreur inconnue')
    const reason =
      error instanceof ConfigError ? 'config' : error instanceof StorageError ? 'storage' : 'token_exchange_failed'
    return finish(`/connect?channel=meta&error=${reason}`)
  }
}
