/**
 * Chargement des dictionnaires. Les trois langues sont moulées dans `Dictionary` : une clé
 * manquante, un tableau de taille différente ou une chaîne déplacée fait échouer `tsc`.
 * Les fichiers JSON restent la source unique du texte (aucune chaîne lisible dans le code).
 */
import frJson from '@/dictionaries/fr.json'
import arJson from '@/dictionaries/ar.json'
import enJson from '@/dictionaries/en.json'
import { DEFAULT_LOCALE, LOCALES, type Locale } from './config'
import type { Dictionary } from './schema'

export type { Dictionary } from './schema'

export const DICTIONARIES: Readonly<Record<Locale, Dictionary>> = {
  fr: frJson as Dictionary,
  ar: arJson as Dictionary,
  en: enJson as Dictionary,
}

export const getDictionary = (locale: Locale): Dictionary => DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE]

/**
 * Résolution d'un modèle : `t(dict, 'zones.title', { villes: 10, ville: 'Casablanca' })`.
 * Les marques `{nom}` sont définies dans les JSON ; une marque sans valeur correspondante est
 * laissée telle quelle (visible en revue, plutôt que silencieusement effacée).
 */
export function t(
  template: string | undefined,
  params?: Readonly<Record<string, string | number | null | undefined>>,
): string {
  if (!template) return ''
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = params[key]
    return value === undefined || value === null ? match : String(value)
  })
}

/** Chaîne d'un dictionnaire par chemin « section.cle » (utiles pour les messages WhatsApp génériques). */
export function tKey(dict: Dictionary, key: string, params?: Readonly<Record<string, string | number>>): string {
  const value = key.split('.').reduce<unknown>((acc, part) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined), dict)
  return typeof value === 'string' ? t(value, params) : ''
}

/**
 * Message pré-rempli WhatsApp dans la langue d'un dictionnaire. `key` désigne une clé de l'objet
 * `wa` ; l'ouverture (`{hello}`) y est résolue automatiquement, pour que le même message commence de
 * la même façon quel que soit l'endroit d'où l'on clique. Une clé absente donne une chaîne vide
 * plutôt qu'une exception : le lien WhatsApp reste utilisable, juste sans texte pré-rempli.
 */
export function waMessage(dict: Dictionary, key: keyof Dictionary['wa'], params?: Record<string, string | number>): string {
  const template = dict.wa[key]
  return typeof template === 'string' ? t(template, { hello: dict.wa.hello, ...params }) : ''
}

/** Liste ordonnée, garantie non vide, utilisée par toutes les sections itérables. */
export function ordered<T>(items: readonly T[] | undefined, fallback: readonly T[] = []): readonly T[] {
  return Array.isArray(items) && items.length > 0 ? items : fallback
}

/** Langues proposées à l'interface, dans l'ordre d'affichage (français d'abord : langue par défaut). */
export const LOCALE_ORDER: readonly Locale[] = LOCALES
