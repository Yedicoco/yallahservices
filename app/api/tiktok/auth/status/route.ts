import type { NextRequest } from 'next/server'
import { json } from '@/lib/http'
import { VISITOR_COOKIE, readVisitorSession } from '@/lib/security/visitor'

/**
 * PRODUIT 1 — Login Kit public : état de la connexion du visiteur.
 * GET /api/tiktok/auth/status → { connected: false } ou { connected: true, profile: { display_name, avatar_url } }
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const profile = readVisitorSession(request.cookies.get(VISITOR_COOKIE)?.value)
  return json(profile ? { connected: true, profile } : { connected: false })
}
