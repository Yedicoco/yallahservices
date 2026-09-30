import { ConfigError } from '@/lib/security/secrets'
import type { TikTokConfig } from '@/lib/tiktok/config'

/**
 * Hub « Intégrations sociales » : publication multi-réseaux (TikTok, Meta, LinkedIn) pour le
 * compte de l'entreprise, réservé à l'espace interne.
 *
 * Chaque réseau a son propre jeu de variables d'environnement et sa propre application
 * d'éditeur (portail développeur). TikTok réutilise par défaut l'application du Direct Post
 * existant (mêmes identifiants), mais avec sa PROPRE URI de retour : chaque flux OAuth a son
 * callback distinct (le retour d'autorisation doit atterrir dans le bon handler).
 */
export type Integration = 'tiktok' | 'meta' | 'linkedin'
export const INTEGRATIONS: readonly Integration[] = ['tiktok', 'meta', 'linkedin']

// ─── TikTok ────────────────────────────────────────────────────────────────────────────

/**
 * URI de retour du hub : à déclarer chez TikTok (en plus des URIs des produits 1 et 2).
 */
export const TIKTOK_INTEGRATION_CALLBACK_PATH = '/api/integrations/tiktok/auth/callback'

/**
 * Application TikTok du hub d'intégrations (scopes user.info.basic + video.publish).
 * Par défaut, elle réutilise les identifiants du Direct Post (TIKTOK_ADMIN_*, puis TIKTOK_*),
 * mais avec sa propre URI de retour : TIKTOK_INTEGRATION_REDIRECT_URI, sinon déduite du
 * domaine des autres URIs TikTok (à déclarer chez TikTok).
 */
export function tiktokIntegrationConfig(): TikTokConfig {
  const clientKey =
    process.env.TIKTOK_INTEGRATION_CLIENT_KEY || process.env.TIKTOK_ADMIN_CLIENT_KEY || process.env.TIKTOK_CLIENT_KEY
  const clientSecret =
    process.env.TIKTOK_INTEGRATION_CLIENT_SECRET || process.env.TIKTOK_ADMIN_CLIENT_SECRET || process.env.TIKTOK_CLIENT_SECRET
  let redirectUri = process.env.TIKTOK_INTEGRATION_REDIRECT_URI
  if (!redirectUri) {
    const base = process.env.TIKTOK_ADMIN_REDIRECT_URI || process.env.TIKTOK_REDIRECT_URI
    if (base) {
      try {
        redirectUri = new URL(TIKTOK_INTEGRATION_CALLBACK_PATH, base).toString()
      } catch {
        throw new ConfigError('TIKTOK_ADMIN_REDIRECT_URI / TIKTOK_REDIRECT_URI n’est pas une URL valide.')
      }
    }
  }
  if (!clientKey || !clientSecret || !redirectUri) {
    throw new ConfigError(
      'Variables TikTok manquantes pour le hub d’intégrations : TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET et TIKTOK_REDIRECT_URI ' +
        '(ou leurs équivalents TIKTOK_ADMIN_* / TIKTOK_INTEGRATION_*).',
    )
  }
  return { clientKey, clientSecret, redirectUri }
}

/** Mêmes scopes que le Direct Post : lecture du profil + publication de vidéos. */
export const TIKTOK_INTEGRATION_SCOPE = 'user.info.basic,video.publish'

/**
 * Clé HMAC des webhooks TikTok (Content Posting API) : par défaut le client_secret de
 * l'application (c'est la clé documentée par TikTok), surchargeable pour séparer les rôles.
 */
export function tiktokWebhookSecret(): string | null {
  const explicit = process.env.TIKTOK_WEBHOOK_SECRET
  if (explicit) return explicit
  try {
    return tiktokIntegrationConfig().clientSecret
  } catch {
    return null
  }
}

// ─── Meta (Facebook Pages + Instagram) ─────────────────────────────────────────────────

export type MetaConfig = {
  appId: string
  appSecret: string
  redirectUri: string
  /** Version du Graph API, ex. « v23.0 ». */
  apiVersion: string
  graphBase: string
  /** Scopes OAuth (virgules), à déclarer dans l'application Meta pour l'avancer access. */
  scope: string
}

/**
 * Scopes par défaut pour l'auto-publication :
 *  - pages_show_list : lister les Pages de l'entreprise (avec leurs jetons) ;
 *  - pages_manage_posts : publier sur les Pages (feed et vidéos par URL) ;
 *  - pages_read_engagement : lire les statistiques ;
 *  - instagram_basic : rattacher le compte Instagram Business à une Page ;
 *  - instagram_content_publish : publier Reels / carrousels / images.
 */
export const META_DEFAULT_SCOPE =
  'pages_show_list,pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish'

export function metaConfig(): MetaConfig {
  const appId = process.env.META_APP_ID || process.env.FACEBOOK_APP_ID
  const appSecret = process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET
  const redirectUri = process.env.META_REDIRECT_URI
  if (!appId || !appSecret || !redirectUri) {
    throw new ConfigError('Variables Meta manquantes : META_APP_ID, META_APP_SECRET et META_REDIRECT_URI.')
  }
  const rawVersion = process.env.META_API_VERSION || 'v23.0'
  const apiVersion = /^v\d/i.test(rawVersion) ? rawVersion : `v${rawVersion}`
  const graphBase = (process.env.META_API_BASE_URL || 'https://graph.facebook.com').replace(/\/+$/, '')
  const scope = process.env.META_SCOPE || META_DEFAULT_SCOPE
  return { appId, appSecret, redirectUri, apiVersion, graphBase, scope }
}

/**
 * Clé de signature des webhooks Meta (en-tête X-Hub-Signature-256) : par défaut l'app secret
 * (pratique recommandée par Meta), surchargeable.
 */
export function metaWebhookSecret(config: MetaConfig): string | null {
  return process.env.META_WEBHOOK_SECRET || config.appSecret
}

/** Jeton de vérification du subscribe (paramètre hub.verify_token, défini dans le dashboard). */
export function metaVerifyToken(): string | null {
  return process.env.META_WEBHOOK_VERIFY_TOKEN || null
}

// ─── LinkedIn ──────────────────────────────────────────────────────────────────────────

export type LinkedInConfig = {
  clientId: string
  clientSecret: string
  redirectUri: string
  apiBase: string
  authBase: string
  /** Scopes OAuth (espaces), cf. LinkedIn OpenID Connect. */
  scope: string
  /** Identifiant (numérique) de la Company Page par défaut, sinon fourni à chaque publication. */
  organizationId?: string
}

/**
 * Scopes par défaut :
 *  - w_member_social : publier sur le profil de l'utilisateur connecté ;
 *  - w_organization_social : publier sur la Company Page ;
 *  - r_liteprofile : identité de base (remplace les scopes « profile » et « email » dépréciés).
 */
export const LINKEDIN_DEFAULT_SCOPE = 'w_member_social w_organization_social r_liteprofile'

export function linkedinConfig(): LinkedInConfig {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI
  if (!clientId || !clientSecret || !redirectUri) {
    throw new ConfigError('Variables LinkedIn manquantes : LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET et LINKEDIN_REDIRECT_URI.')
  }
  const rawScope = process.env.LINKEDIN_SCOPE
  return {
    clientId,
    clientSecret,
    redirectUri,
    apiBase: (process.env.LINKEDIN_API_BASE_URL || 'https://api.linkedin.com').replace(/\/+$/, ''),
    authBase: (process.env.LINKEDIN_AUTH_BASE_URL || 'https://www.linkedin.com/oauth/v2').replace(/\/+$/, ''),
    scope: rawScope && rawScope.trim() ? rawScope : LINKEDIN_DEFAULT_SCOPE,
    organizationId: process.env.LINKEDIN_ORGANIZATION_ID || undefined,
  }
}

// ─── Tâche planifiée (cron) ────────────────────────────────────────────────────────────

const MIN_CRON_SECRET = 24

/**
 * Secret d'accès à la tâche planifiée de rafraîchissement des jetons (appelée par un
 * planificateur externe : Vercel Cron, Actions, crontab). 24 caractères minimum ; absent,
 * l'endpoint est désactivé (échec fermé).
 */
export function cronSecret(): string | null {
  const value = process.env.CRON_SECRET
  return value && value.length >= MIN_CRON_SECRET ? value : null
}

/** Un réseau est « configuré » quand ses variables d'environnement sont complètes et valides. */
export function isIntegrationConfigured(provider: Integration): boolean {
  try {
    if (provider === 'tiktok') tiktokIntegrationConfig()
    else if (provider === 'meta') metaConfig()
    else linkedinConfig()
    return true
  } catch {
    return false
  }
}
