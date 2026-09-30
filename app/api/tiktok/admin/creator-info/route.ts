import type { NextRequest } from 'next/server'
import { json } from '@/lib/http'
import { denyUnlessAdmin } from '@/lib/security/admin'
import { getValidAdminAccessToken } from '@/lib/storage/admin-account'
import { getStore } from '@/lib/storage/kv'
import { adminErrorResponse } from '@/lib/tiktok/admin-response'
import { queryCreatorInfo } from '@/lib/tiktok/api'

/**
 * PRODUIT 2 — Direct Post interne : état de la connexion et réglages du créateur.
 * GET /api/tiktok/admin/creator-info
 *   → { connected: false [, reconnect, message] }
 *   → { connected: true, creator: { … }, account: { … }, storage }
 * À interroger avant chaque publication (exigence TikTok) ; le jeton est rafraîchi si besoin.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const denied = denyUnlessAdmin(request)
  if (denied) return denied
  try {
    const { accessToken, account } = await getValidAdminAccessToken()
    const creator = await queryCreatorInfo(accessToken)
    return json({
      connected: true,
      creator: {
        avatar_url: creator.creator_avatar_url,
        username: creator.creator_username,
        nickname: creator.creator_nickname,
        privacy_level_options: creator.privacy_level_options ?? [],
        comment_disabled: Boolean(creator.comment_disabled),
        duet_disabled: Boolean(creator.duet_disabled),
        stitch_disabled: Boolean(creator.stitch_disabled),
        max_video_post_duration_sec: creator.max_video_post_duration_sec,
      },
      account: { connected_at: account.connected_at, refresh_expires_at: account.refresh_expires_at, scope: account.scope },
      storage: getStore().kind,
    })
  } catch (error) {
    return adminErrorResponse(error)
  }
}
