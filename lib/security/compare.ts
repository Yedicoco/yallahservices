import { createHash, timingSafeEqual } from 'node:crypto'

/**
 * Comparaison de chaînes en temps constant.
 * On compare les empreintes SHA-256 (toujours de même longueur) : ni le contenu ni la longueur
 * de la valeur attendue ne fuient par le temps de réponse.
 */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}
