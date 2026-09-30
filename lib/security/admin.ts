import type { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { notFoundJson, json } from '@/lib/http'
import { safeEqual } from './compare'
import { adminSecret } from './secrets'
import { seal, unseal } from './seal'

/**
 * Accès à l'espace interne (Direct Post) : un secret d'exploitation (ADMIN_SECRET) échangé
 * contre un cookie de session chiffré, court et HttpOnly.
 *
 * - Sans ADMIN_SECRET valide (24 caractères minimum), l'espace interne est désactivé.
 * - Le cookie est signé avec une clé dérivée d'ADMIN_SECRET : changer le secret invalide
 *   immédiatement toutes les sessions ouvertes.
 * - SameSite=Lax (et non Strict) : le retour d'autorisation TikTok est une navigation
 *   cross-site, le cookie doit y être transmis pour que le callback reconnaisse l'administrateur.
 */
export const ADMIN_COOKIE = 'yallah_admin'
const PURPOSE = 'admin-session/v1'
export const ADMIN_SESSION_SECONDS = 8 * 60 * 60

type AdminPayload = { role: 'admin'; exp: number }

export function isAdminConfigured(): boolean {
  return adminSecret() !== null
}

/** Vérifie la clé saisie, en temps constant. */
export function verifyAdminKey(candidate: string | null | undefined): boolean {
  const secret = adminSecret()
  if (!secret || !candidate) return false
  return safeEqual(candidate, secret)
}

export function createAdminSessionValue(): string | null {
  const secret = adminSecret()
  if (!secret) return null
  const payload: AdminPayload = { role: 'admin', exp: Date.now() + ADMIN_SESSION_SECONDS * 1000 }
  return seal(payload, secret, PURPOSE)
}

function isValidSessionValue(value: string | null | undefined): boolean {
  const secret = adminSecret()
  if (!secret) return false
  const payload = unseal<AdminPayload>(value, secret, PURPOSE)
  return !!payload && payload.role === 'admin' && typeof payload.exp === 'number' && payload.exp > Date.now()
}

export function adminCookieOptions(maxAge = ADMIN_SESSION_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

/** Pour les routes API (requête entrante). */
export function isAdminRequest(request: NextRequest): boolean {
  return isValidSessionValue(request.cookies.get(ADMIN_COOKIE)?.value)
}

/** Pour les pages serveur (cookies() de next/headers). */
export async function isAdminSession(): Promise<boolean> {
  return isValidSessionValue((await cookies()).get(ADMIN_COOKIE)?.value)
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

/** Défense en profondeur contre le CSRF : une requête d'écriture doit venir du même site. */
function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

/**
 * Garde commune des routes API internes.
 * Retourne une réponse à renvoyer telle quelle si l'appelant n'est pas autorisé, sinon null.
 * Un appelant non authentifié reçoit un 404 neutre : l'existence de l'espace n'est pas révélée.
 */
export function denyUnlessAdmin(request: NextRequest): NextResponse | null {
  if (!isAdminRequest(request)) return notFoundJson()
  if (!SAFE_METHODS.has(request.method) && !isSameOrigin(request)) return json({ error: 'forbidden' }, 403)
  return null
}
