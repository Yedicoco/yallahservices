import { json } from '@/lib/http'
import { VISITOR_COOKIE, visitorCookieOptions } from '@/lib/security/visitor'

/**
 * PRODUIT 1 — Login Kit public : déconnexion du visiteur (efface son cookie de session).
 * POST /api/tiktok/auth/logout
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const response = json({ connected: false })
  response.cookies.set(VISITOR_COOKIE, '', visitorCookieOptions(0))
  return response
}
