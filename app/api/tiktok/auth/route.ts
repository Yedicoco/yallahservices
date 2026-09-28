import { randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { TIKTOK_AUTHORIZE_URL, TIKTOK_STATE_COOKIE, cookieOptions, requiredTikTokConfig } from '@/lib/tiktok'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const { clientKey, redirectUri } = requiredTikTokConfig()
    const state = randomBytes(32).toString('hex')
    const params = new URLSearchParams({
      client_key: clientKey,
      scope: 'user.info.basic,video.publish',
      response_type: 'code',
      redirect_uri: redirectUri,
      state,
    })
    const response = NextResponse.redirect(`${TIKTOK_AUTHORIZE_URL}?${params.toString()}`)
    response.cookies.set(TIKTOK_STATE_COOKIE, state, cookieOptions(600))
    return response
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'TikTok OAuth is unavailable' }, { status: 503 })
  }
}
