import type { NextRequest } from 'next/server'
import { json } from '@/lib/http'
import { denyUnlessAdmin } from '@/lib/security/admin'
import { linkedinConfig } from '@/lib/integrations/config'
import { badRequest, integrationErrorResponse, IntegrationNotConnectedError } from '@/lib/integrations/errors'
import { createPost } from '@/lib/integrations/linkedin/api'
import { loadAccount } from '@/lib/integrations/tokens'

/**
 * HUB INTÉGRATIONS — LinkedIn : publication via la Posts API (« /rest/posts »).
 *
 * POST /api/integrations/linkedin/publish
 *   {
 *     text: string,                       // 3 000 caractères max
 *     imageUrl?: string,                  // optionnel : le post devient un post image
 *     target?: 'profile' (défaut) | 'organization',
 *     organizationId?: string,            // si target=organization et non défini par défaut
 *   }
 *   → { ok: true, provider: 'linkedin', post_id }
 *
 * Garde-fous : session admin + contrôle d'origine, jeton valide (60 j, sans refresh —
 * le cron signale l'expiration), identifiant d'organisation numérique vérifié (l'auteur
 * « urn:li:organization:… » est construit uniquement à partir de ce que l'administrateur
 * a déclaré).
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TEXT_MAX = 3000

type PublishBody = {
  text?: unknown
  imageUrl?: unknown
  target?: unknown
  organizationId?: unknown
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

  const text = typeof body.text === 'string' ? body.text.trim() : ''
  let imageUrl: string | null = null
  if (typeof body.imageUrl === 'string' && body.imageUrl) {
    try {
      imageUrl = new URL(body.imageUrl).protocol === 'https:' ? body.imageUrl.trim() : null
    } catch {
      imageUrl = null
    }
  }

  const target = body.target === 'organization' ? 'organization' : 'profile'
  const organizationId =
    typeof body.organizationId === 'string' && /^\d{4,30}$/.test(body.organizationId.trim())
      ? body.organizationId.trim()
      : undefined

  try {
    const account = await loadAccount('linkedin')
    if (!account?.accessToken) throw new IntegrationNotConnectedError('linkedin')
    const config = linkedinConfig()

    let author: string
    if (target === 'organization') {
      const orgId = organizationId ?? config.organizationId
      if (!orgId) {
        return badRequest('organization_required', "Indiquez l'identifiant de la Company Page (organizationId) ou définissez LINKEDIN_ORGANIZATION_ID.")
      }
      author = `urn:li:organization:${orgId}`
    } else {
      author = 'urn:li:members:me'
    }

    if (!text && !imageUrl) return badRequest('content_required', 'Une publication LinkedIn nécessite un texte et/ou une image.')
    if (text.length > TEXT_MAX) return badRequest('text_too_long', `Le texte dépasse ${TEXT_MAX} caractères.`)

    const result = await createPost(config, account.accessToken, {
      author,
      text: text || undefined,
      imageUrl: imageUrl ?? undefined,
    })
    return json({ ok: true, provider: 'linkedin', target, post_id: result.id })
  } catch (error) {
    return integrationErrorResponse(error, 'linkedin')
  }
}
