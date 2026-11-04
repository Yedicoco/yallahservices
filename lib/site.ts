import type { CityId } from './content'

export const SITE = {
  name: 'Yallah Services',
  baseCity: 'casablanca' as CityId,
  country: 'MA',
  phoneDisplay: '+212 691 733 585',
  phoneDigits: '212691733585',
  phoneCoreDigits: '691733585',
  email: 'servicesyallah@gmail.com',
  logoUrl: '/yallah-services-logo.png',
  socials: {
    tiktok: { id: 'tiktok', label: 'TikTok', handle: '@yallah.services.m', url: 'https://www.tiktok.com/@yallah.services.m' },
    instagram: { id: 'instagram', label: 'Instagram', handle: '@yallahservice', url: 'https://www.instagram.com/yallahservice' },
    facebook: { id: 'facebook', label: 'Facebook', handle: 'yallahservicesmaroc', url: 'https://www.facebook.com/yallahservicesmaroc' },
    linkedin: { id: 'linkedin', label: 'LinkedIn', handle: 'Yallah Services', url: 'https://www.linkedin.com/in/yallah-services' },
  },
} as const

export const LEGAL = {
  privacy: { id: 'privacy', href: '/confidentialite' },
  terms: { id: 'terms', href: '/cgu' },
} as const

/** Adresse publique canonique du site, surchargeable par variable d’environnement. */
export function siteUrl(): string {
  const clean = (value: string) => `https://${value.replace(/^https?:\/\//i, '').replace(/\/+$/, '')}`
  const explicit = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  if (explicit) return /^http:\/\/(localhost|127\.0\.0\.1)/i.test(explicit) ? explicit.replace(/\/+$/, '') : clean(explicit)
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (production) return clean(production)
  return 'https://yallahservices-one.vercel.app'
}
