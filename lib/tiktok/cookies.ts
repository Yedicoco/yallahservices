/**
 * Cookies d'état OAuth, distincts pour chaque produit TikTok (aucun partage possible entre
 * le Login Kit public et le Direct Post interne).
 *
 * Le chemin est « / » volontairement : l'URI de retour peut être servie par un ancien alias
 * (/api/auth/callback, /api/tiktok/callback) réécrit vers la vraie route ; le navigateur
 * filtre les cookies sur l'URL visible, pas sur la route interne. La valeur est aléatoire,
 * HttpOnly et expire en 10 minutes.
 */
export const LOGIN_STATE_COOKIE = 'yallah_tt_login_state'
export const ADMIN_STATE_COOKIE = 'yallah_tt_admin_state'

export function stateCookieOptions(maxAge = 600) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export function expiredCookieOptions() {
  return stateCookieOptions(0)
}
