/**
 * Configuration i18n de la vitrine : trois langues, aucune dépendance externe.
 *
 *  - `fr` : français, langue par défaut (marché principal, contenu historique du site) ;
 *  - `ar` : darija (arabe marocain) en écriture arabe — seule langue `rtl` du site ;
 *  - `en` : anglais, pour les clients internationaux et les Marocains de l'étranger.
 *
 * Module « neutre » : sans dépendance au serveur (ni `next/headers`, ni `node:`), il est
 * utilisable côté serveur ET côté navigateur (bascule de langue, application de `dir`/`lang`).
 * Le choix du visiteur est persisté deux fois : cookie (lu au rendu, donc le HTML servi est
 * déjà dans la bonne langue) et localStorage (repli si le cookie a expiré).
 */

export const LOCALES = ['fr', 'ar', 'en'] as const
export type Locale = (typeof LOCALES)[number]

/** Langue servie quand rien n'a pu être déterminé (aucun cookie, aucun `Accept-Language` pertinent). */
export const DEFAULT_LOCALE: Locale = 'fr'

export type Direction = 'ltr' | 'rtl'

export type LocaleMeta = {
  /** Valeur de l'attribut `lang` de `<html>` (BCP 47, avec la région marocaine). */
  htmlLang: string
  /** Sens de lecture : `rtl` pour l'arabe, `ltr` pour le français et l'anglais. */
  dir: Direction
  /** Valeur hreflang demandée : `fr-MA`, `ar-MA`, `en-MA`. */
  hreflang: string
  /** Locale Open Graph (`fr_MA`, `ar_MA`, `en_MA`). */
  ogLocale: string
  /** Nom de la langue, écrit dans SA propre langue : c'est ce que lit un visiteur qui ne parle pas français. */
  nativeName: string
  /** Code affiché dans la bascule de langue. */
  short: string
}

export const LOCALES_META: Readonly<Record<Locale, LocaleMeta>> = {
  fr: { htmlLang: 'fr-MA', dir: 'ltr', hreflang: 'fr-MA', ogLocale: 'fr_MA', nativeName: 'Français', short: 'FR' },
  ar: { htmlLang: 'ar-MA', dir: 'rtl', hreflang: 'ar-MA', ogLocale: 'ar_MA', nativeName: 'الدارجة المغربية', short: 'AR' },
  en: { htmlLang: 'en-MA', dir: 'ltr', hreflang: 'en-MA', ogLocale: 'en_MA', nativeName: 'English', short: 'EN' },
}

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value)

export const directionOf = (locale: Locale): Direction => LOCALES_META[locale].dir
export const isRtl = (locale: Locale): boolean => directionOf(locale) === 'rtl'

/** Nom de la langue dans la langue cible (libellés de la bascule, aria-labels). */
export const LOCALE_NAMES: Readonly<Record<Locale, Record<Locale, string>>> = {
  fr: { fr: 'Français', ar: 'الدارجة المغربية', en: 'English' },
  ar: { fr: 'الفرنسية', ar: 'الدارجة المغربية', en: 'الإنجليزية' },
  en: { fr: 'French', ar: 'Moroccan Darija', en: 'English' },
}

/** Libellé court, lisible par un francophone : sert aux textes alternatifs et aux journaux. */
export const LOCALE_LABELS_FR: Readonly<Record<Locale, string>> = {
  fr: 'français',
  ar: 'darija (arabe marocain)',
  en: 'anglais',
}

/* ------------------------------------------------------------------ */
/* Préférences du visiteur                                             */
/* ------------------------------------------------------------------ */

/**
 * Cookie de langue. Préfixé « yallah_ » pour ne rien heurter : le cookie d'usage `NEXT_LOCALE`
 * est réservé au pattern `i18n/routing` de next-intl, que ce site n'utilise pas (pas de /fr/… dans les URL).
 * Il doit rester lisible par le navigateur (pas de `HttpOnly`) : c'est lui que la bascule écrit côté client.
 */
export const LOCALE_COOKIE = 'yallah_locale'

/** Clé localStorage : repli si le cookie a expiré ou a été effacé. */
export const LOCALE_STORAGE_KEY = 'yallah.locale'

/** 1 an : une préférence de langue est durable. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

/** URL de langue « propre » (`/?lang=ar`) : partageable, indexable, et seule version servie sans cookie. */
export const LOCALE_QUERY_PARAM = 'lang'

/** Adresse d'une version linguistique de la page d'accueil. */
export function localeUrl(origin: string, locale: Locale): string {
  const base = origin.replace(/\/+$/, '') || ''
  return locale === DEFAULT_LOCALE ? `${base}/` : `${base}/?${LOCALE_QUERY_PARAM}=${locale}`
}

/** Paramètres de pose du cookie (mêmes attributs que le cookie de session visiteur, sans HttpOnly). */
export function localeCookieOptions() {
  return {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  } as const
}

/** Écriture du cookie côté navigateur (la bascule de langue l'appelle avant de re-rendre la page). */
export function writeLocaleCookie(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`
}

export function readStoredLocale(): Locale | null {
  try {
    const value = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return isLocale(value) ? value : null
  } catch {
    // Navigation privée, stockage désactivé ou plein : on ignore silencieusement, le cookie suffit.
    return null
  }
}

export function writeStoredLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // Même raison : la préférence se perdra, le site reste pleinement utilisable.
  }
}

/**
 * Attributs `lang` et `dir` du document. Source unique : le rendu serveur (attributs sur `<html>`)
 * et la bascule immédiate côté client appliquent exactement la même règle.
 */
export function documentAttributes(locale: Locale): { lang: string; dir: Direction } {
  const meta = LOCALES_META[locale]
  return { lang: meta.htmlLang, dir: meta.dir }
}

/**
 * Isolation bidirectionnelle d'une valeur latine (n° de téléphone, e-mail, nom de marque) insérée
 * dans une phrase arabe : le navigateur ne réordonne plus la ponctuation autour, et un lecteur
 * d'écran change de voix au bon endroit. `undefined` en français/anglais (rien à isoler) comme pour
 * une valeur déjà arabe (elle suit l'ordre du paragraphe).
 */
export function latinValueAttrs(locale: Locale, value: string | null | undefined): { dir: 'ltr'; lang: string } | undefined {
  if (!value || !isRtl(locale)) return undefined
  const hasArabic = /[\u0590-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(value)
  return hasArabic ? undefined : { dir: 'ltr', lang: 'fr' }
}

/** `Accept-Language` → meilleure langue prise en charge (« fr-MA,fr;q=0.9,en;q=0.8 » → `fr`). */
export function fromAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null
  for (const part of header.split(',')) {
    const [tag, ...params] = part.trim().split(';')
    const quality = Number.parseFloat(params.find((p) => p.trim().startsWith('q='))?.slice(2) ?? '1')
    if (Number.isNaN(quality) || quality <= 0) continue
    const base = (tag || '').toLowerCase().split('-')[0]
    const match = LOCALES.find((locale) => locale === base)
    if (match) return match
  }
  return null
}
