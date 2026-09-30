/**
 * Informations officielles de Yallah Services (source : fiche « Présentation Yallah Services »).
 * Module sans dépendance serveur ni React : utilisable côté serveur et côté navigateur.
 *
 * Volontairement dépourvu de texte à traduire : la devise, les descriptions, les titres des pages
 * légales et les libellés de l'interface vivent dans les dictionnaires (`dictionaries/*.json`),
 * pour que le site soit intégralement traduit en français, en darija et en anglais.
 */
import type { CityId } from './content'

export const SITE = {
  name: 'Yallah Services',
  baseCity: 'casablanca' as CityId,
  country: 'MA',
  phoneDisplay: '+212 691 733 585',
  /** Format international sans « + » attendu par wa.me. */
  phoneDigits: '212691733585',
  /** Format national (sans le 0 initial) : sert à reconnaître le numéro de l'entreprise dans un texte. */
  phoneCoreDigits: '691733585',
  email: 'servicesyallah@gmail.com',
  /** Logo officiel (hébergé sur le Blob Vercel du projet). */
  logoUrl:
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/da1235a0-a8a6-11f1-ae21-ff04260a3621.png-vH8DW3TxL0jLqWrKaFWAvBFyZ3rZpZ.jpeg',
  /** Les noms de réseaux sont des marques : non traduits. Seuls les libellés d'usage sont dans les dictionnaires. */
  socials: {
    tiktok: { id: 'tiktok', label: 'TikTok', handle: '@yallah.services.m', url: 'https://www.tiktok.com/@yallah.services.m' },
    instagram: { id: 'instagram', label: 'Instagram', handle: '@yallahservice', url: 'https://www.instagram.com/yallahservice' },
    facebook: { id: 'facebook', label: 'Facebook', handle: 'yallahservicesmaroc', url: 'https://www.facebook.com/yallahservicesmaroc' },
    linkedin: { id: 'linkedin', label: 'LinkedIn', handle: 'Yallah Services', url: 'https://www.linkedin.com/in/yallah-services' },
  },
} as const

/**
 * Pages légales (exigence TikTok). Les adresses ne changent pas selon la langue : ces deux documents
 * sont publiés en français, langue contractuelle du service ; le libellé du lien, lui, est traduit
 * (`dict.legal.*`) pour rester lisible par tous les visiteurs.
 */
export const LEGAL = {
  privacy: { id: 'privacy', href: '/confidentialite' },
  terms: { id: 'terms', href: '/cgu' },
} as const

/** Adresse publique du site : domaine Vercel actuel par défaut, surchargeable sans redéploiement séparé. */
export function siteUrl(): string {
  // Tolérant : « monsite.com » sans schéma est complété en https:// plutôt que de faire échouer le build.
  const clean = (value: string) => `https://${value.replace(/^https?:\/\//i, '').replace(/\/+$/, '')}`
  const explicit = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  if (explicit) return /^http:\/\/(localhost|127\.0\.0\.1)/i.test(explicit) ? explicit.replace(/\/+$/, '') : clean(explicit)
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (production) return clean(production)
  return 'https://yallahservices.vercel.app'
}
