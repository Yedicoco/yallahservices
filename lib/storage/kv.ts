import { ConfigError } from '@/lib/security/secrets'

/**
 * Stockage clé/valeur durable pour les jetons du compte administrateur.
 *
 * Pourquoi : sur Vercel, le disque des fonctions est éphémère (un fichier local comme
 * `.data/users.json` disparaît à chaque déploiement ou redémarrage à froid) et un cookie de
 * navigateur n'est pas un stockage serveur. Les jetons doivent donc vivre dans une base externe.
 *
 * Implémentation : Upstash Redis via son API REST (une simple requête HTTPS, aucune dépendance npm).
 * Variables reconnues (injectées automatiquement par l'intégration Vercel Marketplace « Upstash Redis ») :
 *   - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 *   - KV_REST_API_URL / KV_REST_API_TOKEN (anciens noms « Vercel KV », toujours injectés)
 *
 * En développement local uniquement, un stockage mémoire est utilisé si rien n'est configuré.
 * En production, l'absence de configuration est une erreur explicite : on ne perd jamais
 * silencieusement un jeton.
 */
export class StorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorageError'
  }
}

export interface KeyValueStore {
  readonly kind: 'upstash' | 'memory'
  get(key: string): Promise<string | null>
  set(key: string, value: string, ttlSeconds?: number): Promise<void>
  del(key: string): Promise<void>
}

class UpstashRestStore implements KeyValueStore {
  readonly kind = 'upstash' as const

  constructor(
    private readonly url: string,
    private readonly token: string,
  ) {}

  /** Envoie une commande Redis sous forme de tableau JSON (format documenté par Upstash). */
  private async run(command: Array<string | number>): Promise<unknown> {
    let response: Response
    try {
      response = await fetch(this.url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      })
    } catch {
      throw new StorageError('Upstash Redis est injoignable.')
    }
    let body: { result?: unknown; error?: string } = {}
    try {
      body = await response.json()
    } catch {
      // corps vide ou non JSON : traité ci-dessous
    }
    if (!response.ok || body.error) {
      throw new StorageError(`Upstash Redis a refusé la commande (${body.error ?? `HTTP ${response.status}`}).`)
    }
    return body.result
  }

  async get(key: string): Promise<string | null> {
    const result = await this.run(['GET', key])
    return typeof result === 'string' ? result : null
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const command: Array<string | number> = ['SET', key, value]
    if (ttlSeconds && ttlSeconds > 0) command.push('EX', Math.floor(ttlSeconds))
    await this.run(command)
  }

  async del(key: string): Promise<void> {
    await this.run(['DEL', key])
  }
}

type MemoryEntry = { value: string; expiresAt?: number }
const globalForMemory = globalThis as typeof globalThis & { __yallahMemoryStore?: Map<string, MemoryEntry> }

/** Développement local uniquement : survit au rechargement à chaud, pas au redémarrage. */
class MemoryStore implements KeyValueStore {
  readonly kind = 'memory' as const
  private readonly entries = (globalForMemory.__yallahMemoryStore ??= new Map<string, MemoryEntry>())

  async get(key: string): Promise<string | null> {
    const entry = this.entries.get(key)
    if (!entry) return null
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.entries.delete(key)
      return null
    }
    return entry.value
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.entries.set(key, { value, expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined })
  }

  async del(key: string): Promise<void> {
    this.entries.delete(key)
  }
}

export function getStore(): KeyValueStore {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (url && token) return new UpstashRestStore(url.replace(/\/+$/, ''), token)
  if (process.env.NODE_ENV !== 'production') return new MemoryStore()
  throw new ConfigError(
    'Stockage durable non configuré : ajoutez « Upstash Redis » au projet Vercel (Storage → Marketplace). ' +
      'Les variables UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN sont alors injectées automatiquement.',
  )
}
