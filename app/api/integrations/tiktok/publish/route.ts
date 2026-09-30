import type { NextRequest } from 'next/server'
import { validateCaption } from '@/lib/content-rules'
import { json } from '@/lib/http'
import { denyUnlessAdmin } from '@/lib/security/admin'
import { fetchPublishStatus, initDirectPost, queryCreatorInfo } from '@/lib/tiktok/api'
import { checkVideoUrl } from '@/lib/tiktok/video-url'
import { badRequest, integrationErrorResponse } from '@/lib/integrations/errors'
import { getValidTiktokAccessToken } from '@/lib/integrations/tiktok/account'

/**
 * HUB INTÉGRATIONS — TikTok : publication via la Content Posting API (Direct Post) sur
 * @yallah.services.m. Mêmes garde-fous que le Direct Post produit 2 (session admin,
 * contrôle d'origine, règles éditoriales, confirmation explicite, domaine vidéo vérifié,
 * confidentialité parmi les seules options proposées par TikTok).
 *
 * POST /api/integrations/tiktok/publish
 *   { videoUrl, caption, privacyLevel, allowComment, allowDuet, allowStitch,
 *     commercial: { enabled, yourBrand, brandedContent }, isAigc, consent }
 *   → { ok: true, publish_id }
 *
 * GET /api/integrations/tiktok/publish?publish_id=… → état de la publication
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type PublishBody = {
  videoUrl?: unknown
  caption?: unknown
  privacyLevel?: unknown
  allowComment?: unknown
  allowDuet?: unknown
  allowStitch?: unknown
  commercial?: { enabled?: unknown; yourBrand?: unknown; brandedContent?: unknown }
  isAigc?: unknown
  consent?: unknown
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

  if (body.consent !== true) {
    return badRequest('consent_required', 'Confirmez les engagements éditoriaux avant de publier.')
  }

  const caption = typeof body.caption === 'string' ? body.caption.trim() : ''
  const captionCheck = validateCaption(caption)
  if (!captionCheck.ok) return badRequest('caption_rules', captionCheck.errors[0], captionCheck.errors)

  const video = checkVideoUrl(body.videoUrl)
  if (!video.ok) return badRequest('video_url', video.message)

  const privacyLevel = typeof body.privacyLevel === 'string' ? body.privacyLevel : ''
  const commercialEnabled = body.commercial?.enabled === true
  const brandOrganic = commercialEnabled && body.commercial?.yourBrand === true
  const brandedContent = commercialEnabled && body.commercial?.brandedContent === true
  if (commercialEnabled && !brandOrganic && !brandedContent) {
    return badRequest('commercial_choice_required', 'Précisez le type de contenu commercial (votre marque ou partenariat payé).')
  }

  try {
    const { accessToken } = await getValidTiktokAccessToken()

    // Réglages du créateur relus avant CHAQUE publication : ils peuvent avoir changé depuis l'écran.
    const creator = await queryCreatorInfo(accessToken)
    if (!privacyLevel || !(creator.privacy_level_options ?? []).includes(privacyLevel)) {
      return badRequest('privacy_required', 'Choisissez un niveau de confidentialité proposé par TikTok pour ce compte.')
    }
    if (brandedContent && privacyLevel === 'SELF_ONLY') {
      return badRequest('branded_content_private', 'Un contenu de marque (partenariat payé) ne peut pas être publié en privé.')
    }

    const result = await initDirectPost(accessToken, {
      videoUrl: video.url,
      title: caption,
      privacyLevel,
      // Les interactions restent désactivées sauf choix explicite, et jamais si le créateur les a coupées.
      disableComment: creator.comment_disabled || body.allowComment !== true,
      disableDuet: creator.duet_disabled || body.allowDuet !== true,
      disableStitch: creator.stitch_disabled || body.allowStitch !== true,
      brandOrganic,
      brandedContent,
      isAigc: body.isAigc === true,
    })
    return json({ ok: true, provider: 'tiktok', publish_id: result.publish_id })
  } catch (error) {
    return integrationErrorResponse(error, 'tiktok')
  }
}

export async function GET(request: NextRequest) {
  const denied = denyUnlessAdmin(request)
  if (denied) return denied

  const publishId = request.nextUrl.searchParams.get('publish_id')
  if (!publishId || publishId.length > 200) return badRequest('publish_id_required', 'publish_id est requis.')
  try {
    const { accessToken } = await getValidTiktokAccessToken()
    const status = await fetchPublishStatus(accessToken, publishId)
    return json({ ok: true, provider: 'tiktok', ...status })
  } catch (error) {
    return integrationErrorResponse(error, 'tiktok')
  }
}
