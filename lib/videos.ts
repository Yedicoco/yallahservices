import { SITE } from './site'

/**
 * Catalogue des vidéos du site (fichiers dans /public/videos, noms en kebab-case strict).
 * Source unique pour la vitrine publique ET pour le formulaire de publication TikTok interne.
 *
 * Stratégie de contenu (production soutenable) : deux rubriques prioritaires, répétables.
 * Constantes non négociables : CTA WhatsApp systématique, aucun tarif ferme, aucune donnée
 * identifiante de client ou de candidat (ni nom, ni visage, ni coordonnées).
 */
export type RubriqueId = 'bon-profil-du-jour' | 'coulisses-et-questions'

export type VideoEntry = {
  id: string
  /** Nom du fichier dans /public/videos. */
  file: string
  title: string
  description: string
  durationSec: number
  /** Rubrique prioritaire, ou « entreprises » pour le volet B2B (affiché dans la section Entreprises). */
  rubrique: RubriqueId | 'entreprises'
  /** Légende TikTok proposée (l'appel à l'action WhatsApp est ajouté à l'enregistrement). */
  caption: string
}

export const VIDEOS: readonly VideoEntry[] = [
  {
    id: 'besoin-femme-de-menage-casablanca',
    file: 'besoin-d-aide-a-domicile.mp4',
    title: 'Besoin d’une femme de ménage à Casablanca ?',
    description: 'Ménage à domicile, repassage, nettoyage après déménagement : des profils sélectionnés et une disponibilité flexible.',
    durationSec: 25,
    rubrique: 'bon-profil-du-jour',
    caption: 'Besoin d’une femme de ménage à Casablanca ? Des profils sélectionnés, une disponibilité flexible. #LeBonProfilDuJour #Casablanca #YallahServices',
  },
  {
    id: 'plus-de-temps-pour-vous',
    file: 'yallah-service.mp4',
    title: 'Plus de temps pour vous.',
    description: 'Nous prenons soin de votre maison avec sérieux et discrétion : ménage, repassage, nettoyage, à Casablanca et environs.',
    durationSec: 30,
    rubrique: 'bon-profil-du-jour',
    caption: 'Plus de temps pour vous : ménage, repassage, nettoyage à Casablanca et environs. #LeBonProfilDuJour #Casablanca #YallahServices',
  },
  {
    id: 'commentez-ville-et-service',
    file: '2026-08-28-151819708.mp4',
    title: 'Commentez « ville + service », on vous répond en privé.',
    description: 'Notre façon de travailler : une orientation honnête, sans engagement, puis la mise en relation avec le bon profil.',
    durationSec: 32,
    rubrique: 'coulisses-et-questions',
    caption: 'Commentez VILLE + SERVICE et on vous écrit en privé. Orientation honnête, sans engagement. #CoulissesYallah #VosQuestions #YallahServices',
  },
  {
    id: 'vous-manquez-de-personnel',
    file: 'prospection-b2b.mp4',
    title: 'Vous manquez de personnel ?',
    description: 'Hôtels, restaurants, chantiers, commerces, événements : du personnel permanent, temporaire ou journalier, adapté à votre besoin.',
    durationSec: 25,
    rubrique: 'entreprises',
    caption: 'Hôtel, restaurant, chantier : vous manquez de personnel ? Permanent, temporaire ou journalier. #Entreprises #YallahServices',
  },
]

export const RUBRIQUES: ReadonlyArray<{
  id: RubriqueId
  title: string
  kicker: string
  description: string
  example: string
  /** Modèle de légende pour une vidéo hors catalogue. */
  captionTemplate: string
}> = [
  {
    id: 'bon-profil-du-jour',
    title: 'Le bon profil du jour',
    kicker: 'Rubrique 1',
    description:
      'Un besoin concret, dans une ville ou un quartier : on part de votre situation, jamais d’une personne. Format court, vertical, pensé pour aller à l’essentiel.',
    example: '« Aujourd’hui, une aide-ménagère disponible à Aïn Diab. »',
    captionTemplate: 'Aujourd’hui : [besoin] à [quartier / ville]. #LeBonProfilDuJour #YallahServices',
  },
  {
    id: 'coulisses-et-questions',
    title: 'Coulisses & Vos Questions',
    kicker: 'Rubrique 2',
    description:
      'Comment se passe la mise en relation, de votre premier message à la mise en contact, et des réponses en vidéo aux questions reçues sur WhatsApp, toujours de façon anonyme.',
    example: '« Comment vérifiez-vous les profils ? Que se passe-t-il après mon message ? »',
    captionTemplate: 'Coulisses : comment se passe la mise en relation, ou une question reçue sur WhatsApp. #CoulissesYallah #YallahServices',
  },
]

/** Engagements rappelés publiquement sur chaque rubrique. */
export const VIDEO_COMMITMENTS = [
  'Jamais de nom ni de visage de candidat ou de client',
  'Aucun tarif ferme : tarifs et disponibilités sont confirmés lors de l’échange',
  'Toujours un accès direct à WhatsApp',
] as const

export const videoSrc = (video: Pick<VideoEntry, 'file'>) => `/videos/${video.file}`
export const posterSrc = (video: Pick<VideoEntry, 'id'>) => `/images/video-posters/${video.id}.jpg`

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(Math.round(totalSeconds % 60)).padStart(2, '0')
  return `${minutes}:${seconds}`
}

export const videosByRubrique = (id: RubriqueId | 'entreprises') => VIDEOS.filter((video) => video.rubrique === id)

/** Adresse absolue d'une vidéo du catalogue, telle que TikTok doit la télécharger (PULL_FROM_URL). */
export const absoluteVideoUrl = (video: Pick<VideoEntry, 'file'>, origin: string) =>
  `${origin.replace(/\/+$/, '')}${videoSrc(video)}`

/** Texte d'appel à l'action ajouté à toute légende TikTok. */
export const CTA_LINE = `📲 WhatsApp : ${SITE.phoneDisplay}`
