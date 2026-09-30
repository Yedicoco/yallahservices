import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto'

/**
 * Chiffrement authentifié (AES-256-GCM) pour les cookies de session et les jetons stockés.
 *
 * - La clé est dérivée du secret par HKDF avec un « purpose » propre à chaque usage :
 *   un jeton scellé pour un usage (ex. session admin) ne peut pas être rejoué pour un autre
 *   (ex. session visiteur), même si le secret de départ est le même.
 * - GCM authentifie les données : toute modification du cookie est détectée et rejetée.
 * - Format : iv.tag.données, chaque partie encodée en base64url.
 */
const SALT = 'yallah-services/seal/v1'

function deriveKey(secret: string, purpose: string): Buffer {
  return Buffer.from(hkdfSync('sha256', secret, SALT, purpose, 32))
}

export function seal(payload: unknown, secret: string, purpose: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', deriveKey(secret, purpose), iv)
  cipher.setAAD(Buffer.from(purpose))
  const data = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()])
  return [iv, cipher.getAuthTag(), data].map((part) => part.toString('base64url')).join('.')
}

export function unseal<T>(token: string | null | undefined, secret: string, purpose: string): T | null {
  if (!token) return null
  try {
    const [ivPart, tagPart, dataPart] = token.split('.')
    if (!ivPart || !tagPart || !dataPart) return null
    const decipher = createDecipheriv('aes-256-gcm', deriveKey(secret, purpose), Buffer.from(ivPart, 'base64url'))
    decipher.setAAD(Buffer.from(purpose))
    decipher.setAuthTag(Buffer.from(tagPart, 'base64url'))
    const plain = Buffer.concat([decipher.update(Buffer.from(dataPart, 'base64url')), decipher.final()])
    return JSON.parse(plain.toString('utf8')) as T
  } catch {
    // Jeton altéré, expiré côté clé, ou mal formé : on le traite comme absent.
    return null
  }
}
