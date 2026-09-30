import { LOCALES, LOCALES_META, localeUrl, type Locale } from '@/lib/i18n/config'
import { LEGAL, siteUrl } from '@/lib/site'

/**
 * Sitemap multi-langues, avec les liens `hreflang` demanded par la spécification.
 *
 * Pourquoi un gestionnaire de route et pas `app/sitemap.ts` : le typage `MetadataRoute.Sitemap`
 * admet bien `alternates.languages`, mais le générateur embarqué de Next 16 ne les écrit pas
 * (aucune chaîne `xhtml:link` dans le rendu). Or c'est précisément ce qui permet à un moteur de
 * recherche d'associer chaque langue à son adresse. On produit donc le XML nous-mêmes, avec un
 * namespace `xhtml` correct et un ensemble d'alternates symétrique (chaque URL déclare les trois
 * langues, y compris la sienne — c'est cette réciprocité que Google vérifie).
 *
 * Chaque langue a une adresse réelle (`/` en français, `/?lang=ar`, `/?lang=en`) ; le proxy
 * convertit le paramètre en cookie et renvoie à l'adresse canonique, ce qui garde les trois
 * versions crawlables et cohérentes avec ce que voit un visiteur.
 *
 * Les pages légales (exigence TikTok) sont publiées en français, langue contractuelle : une seule
 * adresse, sans `hreflang`, pour ne promettre à personne une version qui n'existe pas.
 */
const HOME: ReadonlyArray<{ locale: Locale; priority: string }> = [
  { locale: 'fr', priority: '1.0' },
  { locale: 'ar', priority: '0.9' },
  { locale: 'en', priority: '0.9' },
]

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function homeEntries(base: string): string {
  const alternates = [...LOCALES.map((code) => ({ hreflang: LOCALES_META[code].hreflang, href: localeUrl(base, code) })), { hreflang: 'x-default', href: `${base}/` }]
  return HOME.map(({ locale, priority }) =>
    [
      '  <url>',
      `    <loc>${escape(localeUrl(base, locale))}</loc>`,
      ...alternates.map((item) => `    <xhtml:link rel="alternate" hreflang="${item.hreflang}" href="${escape(item.href)}" />`),
      '    <changefreq>weekly</changefreq>',
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n'),
  ).join('\n')
}

function legalEntries(base: string): string {
  return [LEGAL.privacy, LEGAL.terms]
    .map(
      (page) =>
        [
          '  <url>',
          `    <loc>${escape(`${base}${page.href}`)}</loc>`,
          '    <changefreq>yearly</changefreq>',
          '    <priority>0.3</priority>',
          '  </url>',
        ].join('\n'),
    )
    .join('\n')
}

export async function GET() {
  const base = siteUrl()
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    homeEntries(base),
    legalEntries(base),
    '</urlset>',
    '',
  ].join('\n')

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
