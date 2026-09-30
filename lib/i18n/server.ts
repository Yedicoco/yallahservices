/**
 * Résolution serveur de la langue, sans dépendance au rendu : la même fonction sert au layout
 * racine (`<html lang dir>`), au `generateMetadata` et à la page d'accueil — donc jamais de
 * divergence entre l'en-tête du document et son contenu.
 *
 * Règle de priorité (isolée dans `resolveLocale`, applicable hors HTTP) :
 *   1. cookie `yallah_locale` ;
 *   2. en-tête `Accept-Language` (première visite) ;
 *   3. français, langue par défaut.
 *
 * Le troisième canal d'entrée, `?lang=ar` (lien partageable, version indexable), n'est PAS lu ici :
 * `proxy.ts` le convertit en cookie puis renvoie à l'adresse canonique. Le layout racine ne
 * recevant pas `searchParams` en App Router, cette normalisation est ce qui garantit que la langue
 * demandée et la langue rendue sont nécessairement la même.
 *
 * Résultat mis en cache par requête : la page, ses sections et les métadonnées appellent toutes
 * `resolveSiteText()`, et ne paient la lecture des cookies qu'une fois.
 */
import { cache } from 'react'
import { cookies, headers } from 'next/headers'
import { DEFAULT_LOCALE, LOCALE_COOKIE, fromAcceptLanguage, isLocale, localeCookieOptions, type Locale } from './config'
import { getDictionary, type Dictionary } from './dictionaries'

export type LocaleInput = {
  lang?: string | string[] | null
  cookie?: string | null
  acceptLanguage?: string | null
}

/** Règle de priorité, isolée du contexte HTTP pour pouvoir être relue (et testée) telle quelle. */
export function resolveLocale(input: LocaleInput = {}): Locale {
  const fromParam = Array.isArray(input.lang) ? input.lang[0] : input.lang
  if (isLocale(fromParam)) return fromParam
  if (isLocale(input.cookie)) return input.cookie
  return fromAcceptLanguage(input.acceptLanguage) ?? DEFAULT_LOCALE
}

/**
 * Langue à servir, déterminée depuis la requête. Les valeurs manquantes sont tolérées : un rendu
 * sans en-tête ni cookie retombe sur le français, sans erreur. `cache()` = une seule lecture par
 * requête, partagée par le layout, la page et les métadonnées.
 */
export const resolveRequestLocale = cache(async function resolveRequestLocale(): Promise<{ locale: Locale; urlLang: Locale | null }> {
  const [cookieValue, acceptLanguage] = await Promise.all([
    cookies().then((store) => store.get(LOCALE_COOKIE)?.value ?? null),
    headers()
      .then((store) => store.get('accept-language'))
      .catch(() => null),
  ])
  return { locale: resolveLocale({ cookie: cookieValue, acceptLanguage }), urlLang: null }
})

/** Langue + dictionnaire de la requête courante : l'appel unique dont héritent toutes les sections. */
export async function resolveSiteText(): Promise<{ dict: Dictionary; locale: Locale }> {
  const { locale } = await resolveRequestLocale()
  return { dict: getDictionary(locale), locale }
}

/**
 * Repli hors proxy (routes exclues du matcher) : mémorise la langue retenue pour que la
 * navigation suivante reparte du cookie plutôt que d'un re-calcul. Le cookie n'est pas `HttpOnly` :
 * le navigateur doit pouvoir le lire, et la bascule de langue l'écrit aussi côté client.
 */
export async function rememberLocale(locale: Locale): Promise<void> {
  try {
    const current = (await cookies()).get(LOCALE_COOKIE)?.value
    if (current === locale) return
    ;(await cookies()).set(LOCALE_COOKIE, locale, localeCookieOptions())
  } catch {
    // Contexte en lecture seule (rendu statique, génération de sitemap) : la bascule repose le cookie côté client.
  }
}
