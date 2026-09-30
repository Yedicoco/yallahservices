import type { MetadataRoute } from 'next'
import { LEGAL, siteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}${LEGAL.privacy.href}`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}${LEGAL.terms.href}`, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
