import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

/**
 * Les routes API ne sont pas indexées. L'espace interne n'est volontairement PAS mentionné ici :
 * un robots.txt est public et révélerait son adresse ; sa réponse 404 suffit à l'écarter de l'index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
