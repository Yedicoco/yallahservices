/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/confidentialite', destination: '/privacy.html' },
      { source: '/cgu', destination: '/terms.html' },
      { source: '/api/auth/tiktok', destination: '/api/tiktok/auth' },
      { source: '/api/auth/callback', destination: '/api/tiktok/callback' },
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
