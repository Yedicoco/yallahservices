import { SITE } from './site'

/**
 * Constantes éditoriales NON NÉGOCIABLES, appliquées côté serveur à chaque publication TikTok :
 *   1. CTA final systématique vers le WhatsApp de Yallah Services ;
 *   2. aucun tarif ferme ;
 *   3. aucune donnée identifiante de client ou de candidat (autre numéro, autre e-mail).
 *
 * Un texte ne peut pas prouver l'absence de nom ou de visage dans la vidéo : la confirmation
 * explicite de l'administrateur (case à cocher) complète ces contrôles automatiques.
 * Module pur, partagé entre le serveur (validation) et l'interface (aide à la saisie).
 */
export const CAPTION_MAX_LENGTH = 2200

const AMOUNT_BEFORE_UNIT = /\d[\d\s.,\u00a0\u202f]*\s?(?:dh|dhs|mad|dirhams?|درهم|€|eur|euros?|\$|usd)(?![a-z])/i
const UNIT_BEFORE_AMOUNT = /[€$]\s?\d/
const PRICE_WORD_THEN_NUMBER = /\b(?:prix|tarifs?)\b[^\d\n]{0,12}\d/i
const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi
const PHONE_CANDIDATE = /(?:\+|00)?\d[\d\s().-]{7,}\d/g

export function containsFirmPrice(text: string): boolean {
  return AMOUNT_BEFORE_UNIT.test(text) || UNIT_BEFORE_AMOUNT.test(text) || PRICE_WORD_THEN_NUMBER.test(text)
}

export function hasWhatsAppCta(text: string): boolean {
  const digits = text.replace(/\D/g, '')
  return /whats\s?app/i.test(text) && digits.includes(SITE.phoneCoreDigits)
}

function foreignContacts(text: string): string[] {
  const found: string[] = []
  for (const email of text.match(EMAIL) ?? []) {
    if (email.toLowerCase() !== SITE.email) found.push(email)
  }
  for (const candidate of text.match(PHONE_CANDIDATE) ?? []) {
    const digits = candidate.replace(/\D/g, '')
    if (digits.length >= 9 && !digits.endsWith(SITE.phoneCoreDigits)) found.push(candidate.trim())
  }
  return found
}

export type CaptionCheck = { ok: boolean; errors: string[] }

export function validateCaption(caption: string): CaptionCheck {
  const errors: string[] = []
  const text = caption.trim()
  if (!text) errors.push('La légende est obligatoire.')
  if (text.length > CAPTION_MAX_LENGTH) errors.push(`La légende dépasse ${CAPTION_MAX_LENGTH} caractères.`)
  if (text && !hasWhatsAppCta(text)) errors.push(`La légende doit se terminer par l’appel à l’action WhatsApp (${SITE.phoneDisplay}).`)
  if (containsFirmPrice(text)) errors.push('Aucun tarif ferme dans la légende : les tarifs sont confirmés lors de l’échange.')
  if (foreignContacts(text).length > 0) errors.push('La légende contient un numéro ou un e-mail autre que ceux de Yallah Services : aucune donnée identifiante de client ou de candidat.')
  return { ok: errors.length === 0, errors }
}
