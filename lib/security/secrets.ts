import { randomBytes } from 'node:crypto'

/** Erreur de configuration (variable d'environnement absente ou invalide) : message lisible pour l'exploitant. */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigError'
  }
}

const MIN_SESSION_SECRET = 32
const MIN_ADMIN_SECRET = 24

const globalForSecrets = globalThis as typeof globalThis & { __yallahDevSecret?: string }

/**
 * Secret de chiffrement (sessions visiteur + jetons stockés).
 * En production, SESSION_SECRET est obligatoire (32 caractères minimum) : aucun secret par défaut
 * n'est embarqué dans le code. En développement uniquement, un secret éphémère est généré.
 */
export function sessionSecret(): string {
  const value = process.env.SESSION_SECRET
  if (value && value.length >= MIN_SESSION_SECRET) return value
  if (process.env.NODE_ENV !== 'production') {
    globalForSecrets.__yallahDevSecret ??= randomBytes(32).toString('hex')
    return globalForSecrets.__yallahDevSecret
  }
  throw new ConfigError(`SESSION_SECRET est absent ou trop court (${MIN_SESSION_SECRET} caractères minimum).`)
}

/**
 * Secret d'accès à l'espace interne. S'il est absent ou trop court, l'espace interne est
 * simplement désactivé (échec fermé) : personne ne peut s'y connecter.
 */
export function adminSecret(): string | null {
  const value = process.env.ADMIN_SECRET
  return value && value.length >= MIN_ADMIN_SECRET ? value : null
}
