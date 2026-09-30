import { seal, unseal } from './seal'
import { sessionSecret } from './secrets'

/**
 * Session du visiteur connecté via TikTok (Login Kit).
 *
 * Minimisation des données : on ne conserve que le nom de profil public et l'avatar, dans un
 * cookie chiffré de courte durée. Le jeton d'accès TikTok du visiteur n'est JAMAIS stocké
 * (ni cookie, ni base) : il sert une seule fois à lire le profil, puis il est révoqué.
 */
export const VISITOR_COOKIE = 'yallah_visitor'
const PURPOSE = 'visitor-session/v1'
export const VISITOR_SESSION_SECONDS = 12 * 60 * 60

export type VisitorProfile = { display_name: string; avatar_url?: string }
type VisitorPayload = VisitorProfile & { exp: number }

export function createVisitorSession(profile: VisitorProfile): string {
  const payload: VisitorPayload = { ...profile, exp: Date.now() + VISITOR_SESSION_SECONDS * 1000 }
  return seal(payload, sessionSecret(), PURPOSE)
}

export function readVisitorSession(value: string | null | undefined): VisitorProfile | null {
  let secret: string
  try {
    secret = sessionSecret()
  } catch {
    return null
  }
  const payload = unseal<VisitorPayload>(value, secret, PURPOSE)
  if (!payload || typeof payload.exp !== 'number' || payload.exp <= Date.now()) return null
  if (typeof payload.display_name !== 'string' || !payload.display_name) return null
  return { display_name: payload.display_name, avatar_url: payload.avatar_url }
}

export function visitorCookieOptions(maxAge = VISITOR_SESSION_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}
