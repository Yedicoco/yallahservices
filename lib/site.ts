/**
 * Informations officielles de Yallah Services (source : fiche « Présentation Yallah Services »).
 * Module sans dépendance serveur : utilisable côté serveur et côté navigateur.
 */
export const SITE = {
  name: 'Yallah Services',
  tagline: 'Le bon profil, au bon endroit.',
  description:
    'Yallah Services recherche et met en relation des profils de personnel qualifiés pour les particuliers et les entreprises au Maroc.',
  baseCity: 'Casablanca',
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
  socials: {
    tiktok: { label: 'TikTok', handle: '@yallah.services.m', url: 'https://www.tiktok.com/@yallah.services.m' },
    instagram: { label: 'Instagram', handle: '@yallahservice', url: 'https://www.instagram.com/yallahservice' },
    facebook: { label: 'Facebook', handle: 'yallahservicesmaroc', url: 'https://www.facebook.com/yallahservicesmaroc' },
    linkedin: { label: 'LinkedIn', handle: 'Yallah Services', url: 'https://www.linkedin.com/in/yallah-services' },
  },
} as const

/** Pages légales (exigence TikTok) : les deux adresses « propres » et les fichiers statiques sont valides. */
export const LEGAL = {
  privacy: { label: 'Politique de confidentialité', href: '/confidentialite' },
  terms: { label: "Conditions d'utilisation", href: '/cgu' },
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
