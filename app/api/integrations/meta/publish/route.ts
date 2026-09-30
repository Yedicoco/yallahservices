import type { NextRequest } from 'next/server'
import { json } from '@/lib/http'
import { denyUnlessAdmin } from '@/lib/security/admin'
import { metaConfig } from '@/lib/integrations/config'
import { badRequest, integrationErrorResponse, IntegrationNotConnectedError } from '@/lib/integrations/errors'
import {
  createInstagramMedia,
  postPageVideoByURL,
  postToPageFeed,
  publishInstagramMedia,
} from '@/lib/integrations/meta/api'
import { loadAccount, type IntegrationAccount, type MetaPageAccount } from '@/lib/integrations/tokens'

/**
 * HUB INTÉGRATIONS — Meta : auto-publication sur une Page Facebook et/ou Instagram Reels.
 *
 * POST /api/integrations/meta/publish
 *   {
 *     target: 'facebook' (défaut) | 'instagram',
 *     pageId?: string,          // si plusieurs Pages sont connectées
 *     text?: string,            // message du feed / légende Instagram
 *     link?: string,            // facebook uniquement : post avec lien
 *     videoUrl?: string,        // facebook : vidéo par URL — instagram : REELS
 *     imageUrl?: string,        // instagram : image unique
 *     imageUrls?: string[],     // instagram : carrousel (≥ 2 images)
 *   }
 *   → { ok: true, provider: 'meta', target, post_id }
 *
 * Garde-fous : session admin + contrôle d'origine, URL https publiques uniquement,
 * longueur des textes bornée, Page ciblée vérifiée dans les jetons stockés (on ne publie
 * jamais avec un jeton qui ne serait pas celui de la Page demandée).
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const FEED_MESSAGE_MAX = 4000
const INSTAGRAM_CAPTION_MAX = 2200

type PublishBody = {
  target?: unknown
  pageId?: unknown
  text?: unknown
  link?: unknown
  videoUrl?: unknown
  imageUrl?: unknown
  imageUrls?: unknown
}

function httpsUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? value.trim() : null
  } catch {
    return null
  }
}

function pickPage(account: IntegrationAccount, pageId: string | undefined, requireInstagram: boolean): MetaPageAccount {
  const pages = account.pages ?? []
  if (pageId) {
    const page = pages.find((candidate) => candidate.pageId === pageId)
    if (!page) throw new MetaPageNotFound('page_inconnue')
    if (requireInstagram && !page.instagramId) throw new MetaPageNotFound('page_sans_instagram')
    return page
  }
  const candidates = requireInstagram ? pages.filter((page) => page.instagramId) : pages
  if (candidates.length === 0) throw new MetaPageNotFound(requireInstagram ? 'aucune_page_instagram' : 'aucune_page_connectee')
  if (candidates.length > 1) throw new MetaPageNotFound('page_requise')
  return candidates[0]
}

class MetaPageNotFound extends Error {
  constructor(readonly code: string) {
    super(`Page Meta introuvable (${code}).`)
    this.name = 'MetaPageNotFound'
  }
}

export async function POST(request: NextRequest) {
  const denied = denyUnlessAdmin(request)
  if (denied) return denied

  let body: PublishBody
  try {
    body = (await request.json()) as PublishBody
  } catch {
    return badRequest('invalid_json', 'Corps JSON invalide.')
  }

  const target = body.target === 'instagram' ? 'instagram' : body.target === 'facebook' ? 'facebook' : null
  if (!target) return badRequest('target_required', "target doit être « facebook » ou « instagram ».")

  const text = typeof body.text === 'string' ? body.text.trim() : ''
  const link = httpsUrl(body.link)
  const videoUrl = httpsUrl(body.videoUrl)
  const imageUrl = httpsUrl(body.imageUrl)
  const imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls.map((value) => httpsUrl(value)).filter((value): value is string => value !== null) : []
  const pageId = typeof body.pageId === 'string' && body.pageId.trim() ? body.pageId.trim() : undefined

  try {
    const account = await loadAccount('meta')
    if (!account) throw new IntegrationNotConnectedError('meta')
    const config = metaConfig()

    if (target === 'facebook') {
      if (!text && !videoUrl) {
        return badRequest('content_required', 'Une publication Facebook nécessite un texte et/ou une vidéo (videoUrl).')
      }
      if (text.length > FEED_MESSAGE_MAX) {
        return badRequest('message_too_long', `Le message dépasse ${FEED_MESSAGE_MAX} caractères.`)
      }

      const page = pickPage(account, pageId, false)
      if (videoUrl) {
        const result = await postPageVideoByURL(config, page.accessToken, page.pageId, {
          url: videoUrl,
          description: text || undefined,
        })
        return json({ ok: true, provider: 'meta', target: 'facebook', kind: 'video', post_id: result.id, page: page.pageName ?? page.pageId })
      }
      const result = await postToPageFeed(config, page.accessToken, page.pageId, {
        message: text || (link ?? ''),
        link: link ?? undefined,
      })
      return json({ ok: true, provider: 'meta', target: 'facebook', kind: 'feed', post_id: result.id, page: page.pageName ?? page.pageId })
    }

    // ── Instagram ─
    const caption = text
    if (caption.length > INSTAGRAM_CAPTION_MAX) {
      return badRequest('caption_too_long', `La légende Instagram dépasse ${INSTAGRAM_CAPTION_MAX} caractères.`)
    }
    const mediaType = videoUrl ? 'REELS' : imageUrls.length >= 2 ? 'CARROUSEL' : imageUrl ? 'IMAGE' : null
    if (!mediaType) {
      return badRequest('content_required', 'Une publication Instagram nécessite videoUrl (Reel), imageUrl (photo) ou imageUrls (carrousel).')
    }

    const page = pickPage(account, pageId, true)
    const { creationId } = await createInstagramMedia(config, page.accessToken, page.instagramId as string, {
      mediaType,
      videoUrl: videoUrl ?? undefined,
      imageUrl: imageUrl ?? undefined,
      imageUrls: mediaType === 'CARROUSEL' ? imageUrls : undefined,
      caption: caption || undefined,
    })
    const result = await publishInstagramMedia(config, page.accessToken, page.instagramId as string, creationId)
    return json({ ok: true, provider: 'meta', target: 'instagram', kind: mediaType.toLowerCase(), post_id: result.id, page: page.instagramUsername ?? page.pageId })
  } catch (error) {
    if (error instanceof MetaPageNotFound) return badRequest(error.code, error.message)
    return integrationErrorResponse(error, 'meta')
  }
}
