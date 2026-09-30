import { tiktokApiBase } from './config'

/** Erreur renvoyée par TikTok (code + message), exploitable côté interface. */
export class TikTokApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 502,
  ) {
    super(message)
    this.name = 'TikTokApiError'
  }
}

type Envelope<T> = { data?: T; error?: { code?: string; message?: string; log_id?: string } }

async function call<T>(path: string, accessToken: string, init: { method: 'GET' | 'POST'; body?: unknown }): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${tiktokApiBase()}${path}`, {
      method: init.method,
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json; charset=UTF-8' },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    })
  } catch {
    throw new TikTokApiError('network_error', 'TikTok est injoignable pour le moment.', 504)
  }
  const body = (await response.json().catch(() => ({}))) as Envelope<T>
  const code = body.error?.code
  // TikTok peut répondre HTTP 200 avec error.code différent de « ok » : on vérifie les deux.
  if (!response.ok || (code && code !== 'ok')) {
    throw new TikTokApiError(code ?? `http_${response.status}`, body.error?.message || 'Erreur renvoyée par TikTok.', response.status)
  }
  return body.data as T
}

/** Profil public du visiteur (scope user.info.basic). */
export type TikTokUser = { open_id?: string; display_name?: string; avatar_url?: string }

export async function fetchUserInfo(accessToken: string): Promise<TikTokUser> {
  const data = await call<{ user?: TikTokUser }>('/v2/user/info/?fields=open_id,avatar_url,display_name', accessToken, { method: 'GET' })
  return data?.user ?? {}
}

/** Réglages du créateur : à interroger avant chaque publication (exigence TikTok). */
export type CreatorInfo = {
  creator_avatar_url: string
  creator_username: string
  creator_nickname: string
  privacy_level_options: string[]
  comment_disabled: boolean
  duet_disabled: boolean
  stitch_disabled: boolean
  max_video_post_duration_sec: number
}

export async function queryCreatorInfo(accessToken: string): Promise<CreatorInfo> {
  return call<CreatorInfo>('/v2/post/publish/creator_info/query/', accessToken, { method: 'POST', body: {} })
}

export type DirectPostInput = {
  videoUrl: string
  title: string
  privacyLevel: string
  disableComment: boolean
  disableDuet: boolean
  disableStitch: boolean
  /** Promotion de sa propre marque (déclaration « contenu commercial »). */
  brandOrganic: boolean
  /** Partenariat payé / contenu de marque. */
  brandedContent: boolean
  isAigc: boolean
}

/** Lance une publication directe depuis une URL (PULL_FROM_URL, domaine vérifié chez TikTok). */
export async function initDirectPost(accessToken: string, input: DirectPostInput): Promise<{ publish_id: string }> {
  return call<{ publish_id: string }>('/v2/post/publish/video/init/', accessToken, {
    method: 'POST',
    body: {
      post_info: {
        title: input.title,
        privacy_level: input.privacyLevel,
        disable_comment: input.disableComment,
        disable_duet: input.disableDuet,
        disable_stitch: input.disableStitch,
        brand_content_toggle: input.brandedContent,
        brand_organic_toggle: input.brandOrganic,
        is_aigc: input.isAigc,
      },
      source_info: { source: 'PULL_FROM_URL', video_url: input.videoUrl },
    },
  })
}

export type PublishStatus = {
  status: string
  fail_reason?: string
  publicaly_available_post_id?: Array<string | number>
  uploaded_bytes?: number
}

export async function fetchPublishStatus(accessToken: string, publishId: string): Promise<PublishStatus> {
  return call<PublishStatus>('/v2/post/publish/status/fetch/', accessToken, { method: 'POST', body: { publish_id: publishId } })
}
