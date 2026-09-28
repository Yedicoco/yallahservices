import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { TIKTOK_API_URL, TIKTOK_SESSION_COOKIE, decryptSession } from '@/lib/tiktok'

export const runtime = 'nodejs'

type PublishBody = { video_url?: string; title?: string; privacy_level?: string; consent?: boolean; is_aigc?: boolean }

export async function POST(request: NextRequest) {
  const session = decryptSession((await cookies()).get(TIKTOK_SESSION_COOKIE)?.value)
  if (!session) return NextResponse.json({ error: 'TikTok account authorization required.' }, { status: 401 })
  if (session.expires_at <= Date.now()) return NextResponse.json({ error: 'TikTok access token expired; reconnect the account.' }, { status: 401 })

  let body: PublishBody
  try { body = await request.json() as PublishBody } catch { return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 }) }
  if (body.consent !== true) return NextResponse.json({ error: 'Explicit consent is required before publishing.' }, { status: 400 })
  if (!body.video_url || !/^https:\/\//i.test(body.video_url)) return NextResponse.json({ error: 'video_url must be a public HTTPS URL.' }, { status: 400 })
  if (!body.title || body.title.length > 2200) return NextResponse.json({ error: 'title is required and must be at most 2200 characters.' }, { status: 400 })

  try {
    const creatorResponse = await fetch(`${TIKTOK_API_URL}/v2/post/publish/creator_info/query/`, { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }, body: '{}', cache: 'no-store' })
    const creator = await creatorResponse.json() as { data?: { privacy_level_options?: string[] }; error?: { code?: string; message?: string } }
    if (!creatorResponse.ok || creator.error?.code && creator.error.code !== 'ok') return NextResponse.json({ error: creator.error?.message || 'Unable to query TikTok creator settings.' }, { status: 502 })
    const options = creator.data?.privacy_level_options ?? []
    const privacy = body.privacy_level || 'SELF_ONLY'
    if (!options.includes(privacy)) return NextResponse.json({ error: 'Selected privacy level is not available for this TikTok account.', available_privacy_levels: options }, { status: 400 })

    const publishResponse = await fetch(`${TIKTOK_API_URL}/v2/post/publish/video/init/`, { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify({ post_info: { title: body.title, privacy_level: privacy, disable_duet: false, disable_comment: false, disable_stitch: false, brand_organic_toggle: true, is_aigc: body.is_aigc === true }, source_info: { source: 'PULL_FROM_URL', video_url: body.video_url } }), cache: 'no-store' })
    const result = await publishResponse.json()
    return NextResponse.json(result, { status: publishResponse.ok ? 200 : 502 })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'TikTok publishing failed.' }, { status: 500 })
  }
}
