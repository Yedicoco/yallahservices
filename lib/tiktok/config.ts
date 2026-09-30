import { ConfigError } from '@/lib/security/secrets'

/**
 * Deux produits TikTok distincts, configurés séparément mais avec les mêmes variables de base :
 *
 *  1. Login Kit public (génération de leads) : scope « user.info.basic » uniquement.
 *  2. Direct Post interne (auto-publication)   : scopes « user.info.basic » + « video.publish ».
 *
 * Variables conservées : TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REDIRECT_URI.
 * Le produit interne réutilise par défaut la même application TikTok ; des variables
 * TIKTOK_ADMIN_* optionnelles permettent d'utiliser une application distincte.
 */
export const TIKTOK_AUTHORIZE_URL = 'https://www.tiktok.com/v2/auth/authorize/'
export const SCOPE_LOGIN = 'user.info.basic'
export const SCOPE_DIRECT_POST = 'user.info.basic,video.publish'
export const ADMIN_CALLBACK_PATH = '/api/tiktok/admin/callback'

export type TikTokConfig = { clientKey: string; clientSecret: string; redirectUri: string }

/** Base de l'API TikTok. La surcharge par variable d'environnement sert uniquement aux tests. */
export function tiktokApiBase(): string {
  return (process.env.TIKTOK_API_BASE_URL || 'https://open.tiktokapis.com').replace(/\/+$/, '')
}

/** Configuration du Login Kit public. */
export function loginConfig(): TikTokConfig {
  const clientKey = process.env.TIKTOK_CLIENT_KEY
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET
  const redirectUri = process.env.TIKTOK_REDIRECT_URI
  if (!clientKey || !clientSecret || !redirectUri) {
    throw new ConfigError('Variables TikTok manquantes : TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET et TIKTOK_REDIRECT_URI.')
  }
  return { clientKey, clientSecret, redirectUri }
}

/**
 * Configuration du Direct Post interne.
 * L'URI de retour est distincte de celle du Login Kit : par défaut, même domaine que
 * TIKTOK_REDIRECT_URI avec le chemin /api/tiktok/admin/callback (à déclarer aussi chez TikTok).
 */
export function adminConfig(): TikTokConfig {
  const clientKey = process.env.TIKTOK_ADMIN_CLIENT_KEY || process.env.TIKTOK_CLIENT_KEY
  const clientSecret = process.env.TIKTOK_ADMIN_CLIENT_SECRET || process.env.TIKTOK_CLIENT_SECRET
  let redirectUri = process.env.TIKTOK_ADMIN_REDIRECT_URI
  if (!redirectUri && process.env.TIKTOK_REDIRECT_URI) {
    try {
      redirectUri = new URL(ADMIN_CALLBACK_PATH, process.env.TIKTOK_REDIRECT_URI).toString()
    } catch {
      throw new ConfigError("TIKTOK_REDIRECT_URI n'est pas une URL valide.")
    }
  }
  if (!clientKey || !clientSecret || !redirectUri) {
    throw new ConfigError('Variables TikTok manquantes pour le Direct Post : TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET et TIKTOK_REDIRECT_URI.')
  }
  return { clientKey, clientSecret, redirectUri }
}
