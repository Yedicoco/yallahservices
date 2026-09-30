import type { NextRequest } from 'next/server'
import { validateCaption } from '@/lib/content-rules'
import { json } from '@/lib/http'
import { denyUnlessAdmin } from '@/lib/security/admin'
import { getValidAdminAccessToken } from '@/lib/storage/admin-account'
import { adminErrorResponse, badRequest } from '@/lib/tiktok/admin-response'
import { fetchPublishStatus, initDirectPost, queryCreatorInfo } from '@/lib/tiktok/api'
import { checkVideoUrl } from '@/lib/tiktok/video-url'

/**
 * PRODUIT 2 — Direct Post interne : publication sur @yallah.services.m.
 *
 * POST /api/tiktok/admin/publish
 *   { videoUrl, caption, privacyLevel, allowComment, allowDuet, allowStitch,
 *     commercial: { enabled, yourBrand, brandedContent }, isAigc, consent }
 *   → { ok: true, publish_id }
 *
 * GET /api/tiktok/admin/publish?publish_id=…  → état de la publication (TikTok /status/fetch/)
 *
 * Garde-fous côté serveur (l'interface ne suffit jamais) : session admin, contrôle d'origine,
 * règles éditoriales (CTA WhatsApp, aucun tarif ferme, aucune coordonnée tierce), confirmation
 * explicite, vidéo hébergée sur un domaine vérifié, niveau de confidentialité choisi parmi ceux
 * que TikTok renvoie pour ce compte (aucune valeur par défaut).
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
    const { accessToken } = await getValidAdminAccessToken()

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
    return json({ ok: true, publish_id: result.publish_id })
  } catch (error) {
    return adminErrorResponse(error)
  }
}

export async function GET(request: NextRequest) {
  const denied = denyUnlessAdmin(request)
  if (denied) return denied

  const publishId = request.nextUrl.searchParams.get('publish_id')
  if (!publishId || publishId.length > 200) return badRequest('publish_id_required', 'publish_id est requis.')
  try {
    const { accessToken } = await getValidAdminAccessToken()
    const status = await fetchPublishStatus(accessToken, publishId)
    return json({ ok: true, ...status })
  } catch (error) {
    return adminErrorResponse(error)
  }
}
