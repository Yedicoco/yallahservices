import { SITE } from './site'

/**
 * Primitives WhatsApp (canal prioritaire). L'URL se construit à partir d'un message déjà traduit :
 * la traduction des messages pré-remplis vit dans les dictionnaires (`dict.wa`), pas ici.
 *
 * `WA` reste la version française de référence, utilisée par les règles éditoriales TikTok
 * (`lib/content-rules.ts` applique les mêmes constantes aux légendes publiées) et comme repli
 * explicite hors contexte de langue.
 */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${SITE.phoneDigits}?text=${encodeURIComponent(message)}`
}

const HELLO = 'Bonjour Yallah Services,'

/** Messages pré-remplis (français), adaptés au besoin exprimé par le visiteur. */
export const WA = {
  general: `${HELLO} j'aimerais échanger sur mon besoin.`,
  particulier: `${HELLO} je suis un particulier et je cherche un profil pour mon domicile. Pouvez-vous me recontacter ? Ma ville : `,
  entreprise: `${HELLO} je représente une entreprise et j'aimerais échanger sur un besoin en personnel. Pouvez-vous me recontacter ?`,
  tarifs: `${HELLO} j'ai consulté la grille indicative et j'aimerais une estimation adaptée à mon besoin (ville, durée, horaires).`,
  zones: `${HELLO} pouvez-vous me confirmer que vous intervenez dans mon secteur ? Ville / quartier : `,
  question: `${HELLO} j'ai une question pour votre rubrique « Coulisses & Vos Questions » : `,
  service: (title: string) => `${HELLO} je suis intéressé(e) par le service « ${title} ». Pouvez-vous me recontacter ? Ma ville : `,
  sector: (need: string) => `${HELLO} ${need}. Pouvez-vous me recontacter ?`,
  prospection: `${HELLO} je souhaite en savoir plus sur votre accompagnement en prospection B2B.`,
  video: (title: string) => `${HELLO} j'ai vu votre vidéo « ${title} » et j'aimerais en parler.`,
} as const
