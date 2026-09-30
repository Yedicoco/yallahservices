import type { NextRequest } from 'next/server'
import { json, notFoundJson, redirectTo } from '@/lib/http'
import { ADMIN_COOKIE, adminCookieOptions, createAdminSessionValue, denyUnlessAdmin, verifyAdminKey } from '@/lib/security/admin'

/**
 * PRODUIT 2 — Direct Post interne : ouverture et fermeture de la session administrateur.
 *
 * GET /api/tiktok/admin/session?key=<ADMIN_SECRET>
 *   Atteinte après validation de la clé par la page /connect. La clé est revérifiée ici (en temps
 *   constant) puis échangée contre un cookie chiffré ; l'administrateur est redirigé vers /connect
 *   SANS la clé dans l'URL. Clé absente, fausse ou espace interne désactivé : 404 neutre.
 *
 * DELETE /api/tiktok/admin/session → ferme la session.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = verifyAdminKey(request.nextUrl.searchParams.get('key')) ? createAdminSessionValue() : null
  if (!session) {
    await new Promise((resolve) => setTimeout(resolve, 700))
    return notFoundJson()
  }
  const response = redirectTo('/connect')
  response.cookies.set(ADMIN_COOKIE, session, adminCookieOptions())
  return response
}

export async function DELETE(request: NextRequest) {
  const denied = denyUnlessAdmin(request)
  if (denied) return denied
  const response = json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, '', adminCookieOptions(0))
  return response
}
