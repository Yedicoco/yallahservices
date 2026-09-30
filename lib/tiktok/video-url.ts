import { siteUrl } from '@/lib/site'

/**
 * Pour PULL_FROM_URL, TikTok exige que la vidéo soit hébergée sur un domaine ou un préfixe d'URL
 * dont vous avez prouvé la propriété (TikTok for Developers → Manage apps → URL properties).
 * On refuse donc d'emblée toute autre adresse : cela évite un refus `url_ownership_unverified`
 * et toute demande de téléchargement vers un hôte arbitraire.
 *
 * Hôte autorisé par défaut : celui du site. Des hôtes supplémentaires (déjà vérifiés chez TikTok)
 * peuvent être ajoutés via TIKTOK_VIDEO_ALLOWED_HOSTS (liste séparée par des virgules).
 */
export function allowedVideoHosts(): string[] {
  const hosts = new Set<string>()
  try {
    hosts.add(new URL(siteUrl()).host.toLowerCase())
  } catch {
    // siteUrl() invalide : seuls les hôtes explicitement listés restent autorisés
  }
  for (const host of (process.env.TIKTOK_VIDEO_ALLOWED_HOSTS ?? '').split(',')) {
    const clean = host.trim().toLowerCase()
    if (clean) hosts.add(clean)
  }
  return [...hosts]
}

export function checkVideoUrl(raw: unknown): { ok: true; url: string } | { ok: false; message: string } {
  if (typeof raw !== 'string' || !raw.trim()) return { ok: false, message: 'Choisissez une vidéo ou indiquez son adresse.' }
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return { ok: false, message: "L'adresse de la vidéo n'est pas valide." }
  }
  if (url.protocol !== 'https:') return { ok: false, message: "L'adresse de la vidéo doit commencer par https://." }
  if (!allowedVideoHosts().includes(url.host.toLowerCase())) {
    return { ok: false, message: `La vidéo doit être hébergée sur un domaine vérifié chez TikTok (${allowedVideoHosts().join(', ')}).` }
  }
  return { ok: true, url: url.toString() }
}
