import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { SITE, siteUrl } from '@/lib/site'
import './globals.css'

// Titre court (≈ 45 caractères) pour ne pas être tronqué dans les résultats de recherche ; le slogan complet sert aux partages.
const TITLE = 'Yallah Services — Personnel qualifié & Aide à domicile au Maroc'
const SHARE_TITLE = 'Yallah Services — Le bon profil, au bon endroit'
const DESCRIPTION = 'Trouvez facilement du personnel de confiance au Maroc : ménage à domicile, garde d’enfants, aides soignantes, chauffeurs et solutions B2B à Casablanca, Rabat et dans tout le Maroc.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: TITLE, template: '%s | Yallah Services' },
  description: DESCRIPTION,
  applicationName: SITE.name,
  keywords: [
    'personnel de maison Maroc',
    'ménage à domicile Casablanca',
    'nounou Rabat',
    'chauffeur privé Maroc',
    'gardiennage villa',
    'recrutement B2B hôtellerie',
    'aide aux personnes âgées',
    'grand ménage Airbnb',
    'personnel hôtel riad restaurant',
    'main-d’œuvre chantier',
    'Yallah Services',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: 'fr_MA',
    url: '/',
    title: SHARE_TITLE,
    description: DESCRIPTION,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: 'summary_large_image', title: SHARE_TITLE, description: DESCRIPTION, images: ['/opengraph-image'] },
  robots: { index: true, follow: true },
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
