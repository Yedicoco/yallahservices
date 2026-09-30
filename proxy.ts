import { NextResponse, type NextRequest } from 'next/server'
import { LOCALE_COOKIE, LOCALE_QUERY_PARAM, fromAcceptLanguage, isLocale, localeCookieOptions, type Locale } from '@/lib/i18n/config'

/**
 * Normalisation de la langue AVANT le rendu (convention `proxy.ts` de Next 16 — l'ex-`proxy.ts`).
 *
 * Le layout racine ne reçoit pas `searchParams` en App Router : s'il devait deviner la langue tout
 * seul, le `<html lang dir>` pourrait diverger du contenu de la page. On fait donc précéder la
 * requête d'une étape unique qui écrit la langue dans un cookie, puis laisse le serveur relire ce
 * cookie — layout, page et métadonnées consomment dès lors LA MÊME source de vérité.
 *
 * Trois règles, dans cet ordre :
 *   1. `?lang=xx` (lien partageable, version indexable) → on mémorise et on renvoie à l'adresse
 *      canonique sans paramètre : URL propre, cookie posé, rendu cohérent ;
 *   2. cookie présent et valide → on le re-poSe simplement avec `Max-Age` (le visiteur ne voit
 *      jamais sa préférence expirer silencieusement) ;
 *   3. aucune information → on écrit la langue déduite d'`Accept-Language` (ou le français), pour
 *      que la navigation suivante parte déjà du cookie.
 *
 * Le corps de la réponse n'est pas réécrit : la bascule de langue côté client fait la même chose
 * (écrire le cookie, puis redemander un rendu), ce qui garde le comportement identique avec ou sans
 * JavaScript.
 */
export function proxy(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get(LOCALE_QUERY_PARAM)
  const cookieValue = request.cookies.get(LOCALE_COOKIE)?.value
  const acceptLanguage = request.headers.get('accept-language')

  const target: Locale | null =
    isLocale(requested) ? requested : isLocale(cookieValue) ? cookieValue : fromAcceptLanguage(acceptLanguage)

  // Rien d'exploitable ET rien à rafraîchir : on ne touche pas à la requête.
  if (!target) return NextResponse.next()

  const needsRedirect = isLocale(requested) && requested !== cookieValue
  const headers = new Headers(request.headers)
  headers.set('x-yallah-locale', target)

  if (needsRedirect) {
    const clean = request.nextUrl.clone()
    clean.searchParams.delete(LOCALE_QUERY_PARAM)
    const response = NextResponse.redirect(clean, 307)
    applyLocaleCookie(response, target)
    return response
  }

  const response = NextResponse.next({ request: { headers } })
  // Le re-posage du cookie est invisible pour le visiteur ; il évite qu'une préférence meure au bout
  // d'un an pile au moment où il recharge la page.
  applyLocaleCookie(response, target)
  return response
}

function applyLocaleCookie(response: NextResponse, locale: Locale) {
  const { path, maxAge, sameSite } = localeCookieOptions()
  response.cookies.set({ name: LOCALE_COOKIE, value: locale, path, maxAge, sameSite })
}

/**
 * Le plus étroit possible : la vitrine uniquement. Restent exclus l'espace interne `/connect` (qui
 * doit rester strictement identique à une URL inconnue, sans cookie ni en-tête superflus), les routes
 * API (TikTok, session, stockage — jamais localisées), les assets servis par `_next`, les fichiers
 * statiques qui portent une extension (média, `.txt` de vérification TikTok, `.html` des pages
 * légales) et `/videos`.
 */
export const config = {
  matcher: ['/((?!api|_next|videos|connect(?:$|/)|[^?]*\\.[a-z0-9]+$).*)'],
}
