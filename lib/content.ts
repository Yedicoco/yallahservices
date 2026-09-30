/**
 * Contenu éditorial de la vitrine. Source : fiche officielle « Présentation Yallah Services »
 * et grille tarifaire officielle (retranscrite ici en données pour être lisible et indexable).
 * Aucun tarif ferme : tout montant est présenté « à titre indicatif ».
 */

export type B2CServiceId = 'menage' | 'garde-enfants' | 'personnes-agees' | 'cuisine' | 'gardiennage' | 'chauffeurs' | 'grand-menage'

/**
 * Visuel d'en-tête d'un service. Toutes les bannières sont livrées en 1408×792 (16:9),
 * en JPEG (repli universel) et en WebP (plus léger), servies via <picture>.
 * Le tiers gauche de chaque bannière reste volontairement vide : il est prévu pour
 * recevoir un titre en surimpression.
 */
export type ServiceImage = { jpg: string; webp: string; alt: string }

/** Services particuliers : description officielle + puces courtes dérivées de cette même description (cartes de la vitrine). */
export const B2C_SERVICES: ReadonlyArray<{
  id: B2CServiceId
  title: string
  description: string
  bullets: readonly string[]
  image?: ServiceImage
}> = [
  {
    id: 'menage',
    title: 'Ménage à domicile',
    description: 'Entretien régulier ou ponctuel, repassage : une maison soignée, sans que vous ayez à y penser.',
    bullets: ['Entretien régulier ou ponctuel', 'Repassage inclus'],
    image: {
      jpg: '/images/banners/01-menage-a-domicile.jpg',
      webp: '/images/banners/01-menage-a-domicile.webp',
      alt: 'Femme de ménage souriante, tablier vert, un chiffon à la main dans un salon marocain lumineux et impeccable.',
    },
  },
  {
    id: 'garde-enfants',
    title: 'Garde d’enfants (nounous)',
    description: 'Une nounou sérieuse pour accompagner vos enfants au quotidien, avec ou sans entretien de la maison.',
    bullets: ['Accompagnement au quotidien', 'Avec ou sans entretien de la maison'],
    image: {
      jpg: '/images/banners/02-garde-denfants.jpg',
      webp: '/images/banners/02-garde-denfants.webp',
      alt: 'Nounou jouant avec un jeune enfant et des jouets en bois dans un coin jeu baigné de lumière naturelle.',
    },
  },
  {
    id: 'personnes-agees',
    title: 'Aide aux personnes âgées',
    description: 'Une présence bienveillante et une aide de tous les jours pour vos proches : garde-malade, accompagnement, entretien.',
    bullets: ['Garde-malade et accompagnement', 'Aide à l’entretien au quotidien'],
    image: {
      jpg: '/images/banners/03-aide-personnes-agees.jpg',
      webp: '/images/banners/03-aide-personnes-agees.webp',
      alt: 'Aide à domicile apportant un thé à la menthe à une personne âgée souriante, installée dans un fauteuil au soleil.',
    },
  },
  {
    id: 'cuisine',
    title: 'Cuisine à domicile',
    description: 'Des repas préparés chez vous, selon vos goûts et vos habitudes, avec ou sans aide à l’entretien.',
    bullets: ['Repas préparés selon vos goûts', 'Avec ou sans aide à l’entretien'],
    image: {
      jpg: '/images/banners/04-cuisine-a-domicile.jpg',
      webp: '/images/banners/04-cuisine-a-domicile.webp',
      alt: 'Cuisinière préparant des ingrédients marocains — menthe fraîche, huile d’olive, agrumes, tomates — sur un plan de travail clair.',
    },
  },
  {
    id: 'gardiennage',
    title: 'Gardiennage',
    description: 'Une présence de confiance pour veiller sur votre domicile ou votre propriété.',
    bullets: ['Domicile ou propriété', 'Présence de confiance'],
    image: {
      jpg: '/images/banners/05-gardiennage.jpg',
      webp: '/images/banners/05-gardiennage.webp',
      alt: 'Gardien souriant devant l’entrée d’une villa marocaine de style riad, palmiers et lumière dorée de fin de journée.',
    },
  },
  {
    id: 'chauffeurs',
    title: 'Chauffeurs',
    description: 'Un chauffeur pour vos trajets du quotidien, selon vos horaires et vos besoins.',
    bullets: ['Trajets du quotidien', 'Selon vos horaires et vos besoins'],
    image: {
      jpg: '/images/banners/06-chauffeurs.jpg',
      webp: '/images/banners/06-chauffeurs.webp',
      alt: 'Chauffeur souriant au volant d’une voiture à l’intérieur en cuir crème, vue depuis la fenêtre côté passager.',
    },
  },
  {
    id: 'grand-menage',
    title: 'Nettoyage & grand ménage',
    description: 'Appartements, résidences, logements Airbnb, remise en état : un nettoyage en profondeur, ponctuel ou régulier.',
    bullets: ['Appartements, résidences et Airbnb', 'Ponctuel ou régulier'],
  },
]

/** Le grand ménage : contenu repris des deux affiches officielles. */
export const GRAND_MENAGE = {
  title: 'Le grand ménage, en profondeur.',
  intro:
    'Pour les résidences Airbnb, les appartements, les couples, les familles et les bureaux : ponctuel, ou 1, 2 ou 3 fois par semaine, selon la fréquence qui vous convient.',
  bullets: ['Grand ménage complet', 'Remise en état', 'Nettoyage en profondeur', 'Parfait pour Airbnb, location courte durée et appartements privés'],
} as const

export type B2BSectorId = 'hotels' | 'riads' | 'restaurants' | 'chantiers' | 'commerces' | 'evenements'

export const B2B_SECTORS: ReadonlyArray<{ id: B2BSectorId; title: string; message: string }> = [
  { id: 'hotels', title: 'Hôtels', message: 'je représente un hôtel et je recherche du personnel' },
  { id: 'riads', title: 'Riads', message: 'je représente un riad et je recherche du personnel' },
  { id: 'restaurants', title: 'Restaurants', message: 'je représente un restaurant et je recherche du personnel' },
  { id: 'chantiers', title: 'Chantiers', message: 'j’ai un chantier et je recherche de la main-d’œuvre' },
  { id: 'commerces', title: 'Commerces', message: 'je représente un commerce et je recherche du personnel' },
  { id: 'evenements', title: 'Événements', message: 'j’organise un événement et je recherche du personnel' },
]

/** Besoins proposés dans le formulaire de contact, volet Entreprises. */
export const B2B_NEEDS: readonly string[] = [
  'Personnel pour un hôtel',
  'Personnel pour un riad',
  'Personnel pour un restaurant',
  'Main-d’œuvre pour un chantier',
  'Personnel pour un commerce',
  'Personnel pour un événement',
  'Main-d’œuvre permanente, temporaire ou journalière',
  'Prospection B2B',
  'Autre besoin',
]

export const B2B_FORMULAS: ReadonlyArray<{ id: string; title: string; description: string }> = [
  { id: 'permanente', title: 'Permanente', description: 'Un collaborateur durable, intégré à votre équipe.' },
  { id: 'temporaire', title: 'Temporaire', description: 'Un renfort pour une saison, un projet ou un remplacement.' },
  { id: 'journalier', title: 'Renfort journalier', description: 'Des bras en plus, à la journée, quand l’activité l’exige.' },
]

export const PROCESS_STEPS: ReadonlyArray<{ title: string; description: string }> = [
  {
    title: 'Vous nous écrivez',
    description: 'Un message WhatsApp ou un appel : vous décrivez votre besoin, votre ville et vos horaires.',
  },
  {
    title: 'Nous sélectionnons',
    description: 'Nous recherchons des profils qualifiés qui correspondent vraiment à votre besoin.',
  },
  {
    title: 'Nous vérifions',
    description: 'Nous vérifions les profils retenus avant de vous les présenter.',
  },
  {
    title: 'Nous vous mettons en relation',
    description: 'Mise en contact, puis accompagnement : nous restons disponibles pour la suite.',
  },
]

/** Villes couvertes (fiche officielle). */
export const CITIES: readonly string[] = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Fès',
  'Tanger',
  'Agadir',
  'Kénitra',
  'Mohammedia',
  'Témara',
  'Salé',
]

/** Quartiers et secteurs prioritaires. */
export const PRIORITY_AREAS: ReadonlyArray<{ city: string; label: string; areas: readonly string[] }> = [
  { city: 'Casablanca', label: 'Casablanca et environs', areas: ['Anfa', 'Aïn Diab', 'Californie', 'Bouskoura'] },
  { city: 'Rabat', label: 'Rabat', areas: ['Souissi', 'Hay Riad'] },
  { city: 'Marrakech', label: 'Marrakech', areas: ['Hivernage', 'Palmeraie'] },
]

/** Mention légale obligatoire, affichée avec la grille. */
export const PRICING_DISCLAIMER =
  'Tarifs donnés à titre indicatif, variables selon la ville, la durée, les horaires et le niveau de responsabilité.'

/**
 * Grille tarifaire officielle (montants en dirhams, tels que publiés, à titre indicatif).
 * La grille source ne précise pas de période : aucune unité n'est ajoutée ici.
 */
export const PRICING_GROUPS: ReadonlyArray<{ title: string; rows: ReadonlyArray<{ service: string; price: string }> }> = [
  {
    title: 'Ménage',
    rows: [
      { service: 'Ménage simple dans villa', price: '4 500' },
      { service: 'Ménage simple dans mini villa', price: '4 000' },
      { service: 'Ménage dans appartement', price: '3 500' },
    ],
  },
  {
    title: 'Nounou (garde d’enfants)',
    rows: [
      { service: 'Nounou d’un enfant', price: '3 500' },
      { service: 'Nounou d’un enfant + ménage', price: '4 000' },
      { service: 'Nounou de 2 enfants avec ménage', price: '4 500 / 5 000' },
      { service: 'Nounou de 3 enfants', price: '4 500' },
      { service: 'Nounou de 3 enfants + ménage', price: '5 000' },
    ],
  },
  {
    title: 'Cuisine',
    rows: [
      { service: 'Cuisine simple', price: '4 000' },
      { service: 'Cuisine / ménage', price: '5 000' },
      { service: 'Aide cuisine', price: '3 500' },
      { service: 'Aide cuisine / ménage', price: '4 000' },
    ],
  },
  {
    title: 'Garde-malade',
    rows: [
      { service: 'Garde malade simple', price: '3 500' },
      { service: 'Garde malade et ménage', price: '4 000' },
    ],
  },
]
