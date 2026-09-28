import { NextRequest, NextResponse } from 'next/server'
import { TIKTOK_API_URL, TIKTOK_SESSION_COOKIE, TIKTOK_STATE_COOKIE, cookieOptions, encryptSession, requiredTikTokConfig } from '@/lib/tiktok'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const expectedState = request.cookies.get(TIKTOK_STATE_COOKIE)?.value
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.json({ error: 'Invalid or expired TikTok authorization state.' }, { status: 400 })
  }

  try {
    const { clientKey, clientSecret, redirectUri } = requiredTikTokConfig()
    const tokenResponse = await fetch(`${TIKTOK_API_URL}/v2/oauth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_key: clientKey, client_secret: clientSecret, code, grant_type: 'authorization_code', redirect_uri: redirectUri }),
      cache: 'no-store',
    })
    const token = await tokenResponse.json() as { access_token?: string; refresh_token?: string; open_id?: string; expires_in?: number; refresh_expires_in?: number; scope?: string; error?: string; error_description?: string }
    if (!tokenResponse.ok || !token.access_token || !token.open_id) {
      return NextResponse.json({ error: token.error_description || token.error || 'TikTok token exchange failed' }, { status: 502 })
    }

    const session = {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      open_id: token.open_id,
      scope: token.scope,
      expires_at: Date.now() + (token.expires_in ?? 86400) * 1000,
      refresh_expires_at: token.refresh_expires_in ? Date.now() + token.refresh_expires_in * 1000 : undefined,
    }
    const response = NextResponse.redirect(new URL('/', request.url))
    const sessionMaxAge = session.refresh_expires_at ? Math.max(0, Math.floor((session.refresh_expires_at - Date.now()) / 1000)) : 30 * 86400
    response.cookies.set(TIKTOK_SESSION_COOKIE, encryptSession(session), cookieOptions(sessionMaxAge))
    response.cookies.set(TIKTOK_STATE_COOKIE, '', { ...cookieOptions(0), maxAge: 0 })
    return response
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'TikTok callback failed' }, { status: 500 })
  }
}
