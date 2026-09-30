import { NextResponse } from 'next/server'

/**
 * Redirection avec un chemin relatif : on ne dépend pas de l'hôte interne vu par le serveur
 * (proxy, prévisualisation, déploiement Vercel), le navigateur résout le chemin lui-même.
 */
export function redirectTo(location: string, status: 303 | 307 = 303): NextResponse {
  return new NextResponse(null, { status, headers: { Location: location, 'Cache-Control': 'no-store' } })
}

/** Réponse JSON jamais mise en cache (sessions, jetons, état de connexion). */
export function json(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

/** Réponse neutre : pour un visiteur, l'espace interne « n'existe pas ». */
export function notFoundJson(): NextResponse {
  return json({ error: 'not_found' }, 404)
}
