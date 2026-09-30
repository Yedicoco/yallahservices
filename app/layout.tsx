import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { SITE, siteUrl } from '@/lib/site'
import './globals.css'

// Titre court (≈ 45 caractères) pour ne pas être tronqué dans les résultats de recherche ; le slogan complet sert aux partages.
const TITLE = 'Yallah Services — Personnel qualifié au Maroc'
const SHARE_TITLE = 'Yallah Services — Le bon profil, au bon endroit'
const DESCRIPTION = `${SITE.description} Ménage, nounous, aide aux personnes âgées, cuisine, gardiennage, chauffeurs, personnel pour hôtels, riads, restaurants et chantiers.`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: TITLE, template: '%s | Yallah Services' },
  description: DESCRIPTION,
  applicationName: SITE.name,
  keywords: [
    'personnel de maison Maroc',
    'femme de ménage Casablanca',
    'nounou Casablanca',
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
    locale: 'fr_FR',
    url: '/',
    title: SHARE_TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: 'summary_large_image', title: SHARE_TITLE, description: DESCRIPTION },
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
  themeColor: '#f6f1e8',
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
