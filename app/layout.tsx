import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { LocaleProvider, LocaleRefreshVeil } from '@/lib/i18n/client'
import { LOCALES, LOCALES_META, localeUrl } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { rememberLocale, resolveRequestLocale } from '@/lib/i18n/server'
import { siteUrl } from '@/lib/site'
import './globals.css'

/**
 * i18n : la langue est choisie à la requête (URL › cookie › `Accept-Language` › français).
 * Page rendue à la requête volontairement : une page mise en cache sur le CDN renverrait à tout le
 * monde la langue du premier visiteur. Le coût est nul ici (une seule page, sans appel externe).
 */
export const dynamic = 'force-dynamic'

/**
 * Métadonnées de la langue servie : titre, description, mots-clés, `og:locale` et liens `hreflang`.
 * Les trois versions sont adressables (`/?lang=…`), ce qui rend chaque langue réellement indexable.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await resolveRequestLocale()
  const dict = getDictionary(locale)
  const meta = LOCALES_META[locale]
  const base = siteUrl()

  const languages: Record<string, string> = {}
  for (const code of LOCALES) languages[LOCALES_META[code].hreflang] = localeUrl(base, code)
  languages['x-default'] = `${base}/`

  return {
    metadataBase: new URL(base),
    // La version française est la référence canonique ; les autres langues y sont rattachées par hreflang.
    title: { default: dict.meta.metaTitle, template: '%s | Yallah Services' },
    description: dict.meta.metaDescription,
    keywords: [...dict.meta.metaKeywords],
    applicationName: dict.brand.name,
    // hreflang : chaque langue a sa propre adresse (`/?lang=…`, normalisée par le proxy), la version
    // française restant la référence canonique. `x-default` couvre les visiteurs sans préférence.
    // Les balises <link> elles-mêmes sont posées dans le <head> du layout : écrites en minuscules,
    // conformes à ce que publient les références W3C/Google.
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: dict.brand.name,
      locale: meta.ogLocale,
      url: localeUrl(base, locale),
      title: dict.meta.ogTitle,
      description: dict.meta.metaDescription,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: dict.meta.metaTitle }],
    },
    twitter: { card: 'summary_large_image', title: dict.meta.ogTitle, description: dict.meta.metaDescription, images: ['/opengraph-image'] },
    robots: { index: true, follow: true },
    generator: 'v0.app',
    icons: {
      icon: [
        { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
        { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
      apple: '/apple-icon.png',
    },
  }
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { locale } = await resolveRequestLocale()
  const { htmlLang: lang, dir } = LOCALES_META[locale]
  // Mémorise la langue devinée ou imposée par l'URL : la navigation suivante repart du cookie.
  await rememberLocale(locale)

  const base = siteUrl()

  return (
    <html lang={lang} dir={dir}>
      <head>
        {/* La langue étant résolue à la requête, c'est ici (et pas dans `generateMetadata`) que l'on
            garde la main sur l'orthographe exacte des attributs `hreflang`. */}
        {LOCALES.map((code) => (
          <link key={code} rel="alternate" hrefLang={LOCALES_META[code].hreflang} href={localeUrl(base, code)} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${base}/`} />
      </head>
      <body className="antialiased">
        {/* Le fournisseur n'apporte que la bascule de langue côté client ; les textes, eux, sont déjà
            traduits dans le HTML (chaque section reçoit son dictionnaire du serveur). */}
        <LocaleProvider locale={locale}>
          <LocaleRefreshVeil />
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </LocaleProvider>
      </body>
    </html>
  )
}
