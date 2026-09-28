import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { TIKTOK_API_URL, TIKTOK_SESSION_COOKIE, decryptSession } from '@/lib/tiktok'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const session = decryptSession((await cookies()).get(TIKTOK_SESSION_COOKIE)?.value)
  if (!session) return NextResponse.json({ error: 'TikTok account authorization required.' }, { status: 401 })
  let body: { publish_id?: string }
  try { body = await request.json() as { publish_id?: string } } catch { return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 }) }
  if (!body.publish_id) return NextResponse.json({ error: 'publish_id is required.' }, { status: 400 })
  const response = await fetch(`${TIKTOK_API_URL}/v2/post/publish/status/fetch/`, { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ publish_id: body.publish_id }), cache: 'no-store' })
  return NextResponse.json(await response.json(), { status: response.ok ? 200 : 502 })
}
