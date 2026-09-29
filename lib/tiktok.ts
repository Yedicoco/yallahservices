import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

export const TIKTOK_AUTHORIZE_URL = 'https://www.tiktok.com/v2/auth/authorize/'
export const TIKTOK_API_URL = 'https://open.tiktokapis.com'
export const TIKTOK_SESSION_COOKIE = 'yallah_tiktok_session'
export const TIKTOK_STATE_COOKIE = 'yallah_tiktok_state'

export type TikTokSession = {
  access_token: string
  refresh_token?: string
  open_id: string
  expires_at: number
  refresh_expires_at?: number
  scope?: string
}

function keyFromSecret() {
  const secret = process.env.SESSION_SECRET || process.env.TIKTOK_TOKEN_SECRET
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters')
  return createHash('sha256').update(secret).digest()
}

export function encryptSession(session: TikTokSession) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', keyFromSecret(), iv)
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(session), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv, tag, encrypted].map((part) => part.toString('base64url')).join('.')
}

export function decryptSession(value: string | undefined): TikTokSession | null {
  if (!value) return null
  try {
    const [ivValue, tagValue, encryptedValue] = value.split('.')
    if (!ivValue || !tagValue || !encryptedValue) return null
    const decipher = createDecipheriv('aes-256-gcm', keyFromSecret(), Buffer.from(ivValue, 'base64url'))
    decipher.setAuthTag(Buffer.from(tagValue, 'base64url'))
    const plain = Buffer.concat([
      decipher.update(Buffer.from(encryptedValue, 'base64url')),
      decipher.final(),
    ]).toString('utf8')
    const session = JSON.parse(plain) as TikTokSession
    if (!session.access_token || !session.open_id || !session.expires_at) return null
    return session
  } catch {
    return null
  }
}

export function requiredTikTokConfig() {
  const values = {
    clientKey: process.env.TIKTOK_CLIENT_KEY,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    redirectUri: process.env.TIKTOK_REDIRECT_URI,
  }
  if (!values.clientKey || !values.clientSecret || !values.redirectUri) {
    throw new Error('TikTok OAuth is not configured. Set TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET and TIKTOK_REDIRECT_URI.')
  }
  return values
}

export function cookieOptions(maxAge: number) {
  return { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/', maxAge }
}
