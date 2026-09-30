/** @type {import('next').NextConfig} */

// Les routes API ne s'indexent ni ne se mettent en cache. (Aucun en-tête propre à /connect : il distinguerait le 404 de
// l'espace interne de celui de n'importe quelle adresse inconnue.)
const privateHeaders = [
  { key: 'Cache-Control', value: 'no-store' },
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
]

const nextConfig = {
  poweredByHeader: false,

  // Développement uniquement (sans effet en production) : Next 16 bloque par défaut les ressources
  // /_next/* demandées depuis une autre origine, ce qui empêche l'hydratation (menu, formulaire,
  // lecteur vidéo) sur un aperçu distant. On autorise le poste local et les aperçus *.e2b.app.
  allowedDevOrigins: ['127.0.0.1', 'localhost', '*.e2b.app'],

  async rewrites() {
    return [
      // Pages légales (exigence TikTok) : adresses propres vers les fichiers statiques.
      { source: '/confidentialite', destination: '/privacy.html' },
      { source: '/cgu', destination: '/terms.html' },
      // Compatibilité : anciens chemins documentés (URIs éventuellement déjà déclarées chez TikTok).
      // Ils pointent désormais vers le Login Kit PUBLIC ; le Direct Post interne a ses propres routes.
      { source: '/api/auth/tiktok', destination: '/api/tiktok/auth' },
      { source: '/api/auth/callback', destination: '/api/tiktok/auth/callback' },
      { source: '/api/tiktok/callback', destination: '/api/tiktok/auth/callback' },
    ]
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      { source: '/api/:path*', headers: privateHeaders },
    ]
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
