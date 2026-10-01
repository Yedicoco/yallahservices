/**
 * Contenu de la vitrine — partie NON traduite : identifiants techniques, nombres, prix, durées.
 *
 * Tout le texte lisible a quitté ce module pour les dictionnaires (`dictionaries/*.json`) :
 * c'est ce qui permet à une même donnée d'être affichée en français, en darija ou en anglais.
 * Les listes ordonnées (services, secteurs, groupes de tarifs, étapes) vivent ici, dans l'ordre
 * éditorial ; les dictionnaires ne fournissent que le libellé de chaque identifiant. Le français
 * reste la source de vérité éditoriale : un libellé manquant se voit (chaîne vide), il ne fait
 * pas échouer le rendu des autres langues.
 */

export type B2CServiceId = 'menage' | 'garde-enfants' | 'personnes-agees' | 'cuisine' | 'gardiennage' | 'chauffeurs' | 'grand-menage'

/** Services particuliers, dans l'ordre d'affichage. Le dernier (« grand-menage ») a son propre bloc. */
export const B2C_SERVICE_IDS: readonly B2CServiceId[] = ['menage', 'garde-enfants', 'personnes-agees', 'cuisine', 'gardiennage', 'chauffeurs', 'grand-menage']

/** Services particuliers proposant explicitement la segmentation Logée (24h/24) / Non logée (horaires journée). */
export type SegmentedB2CServiceId = 'menage' | 'garde-enfants' | 'cuisine'

export const SEGMENTED_B2C_SERVICE_IDS: readonly SegmentedB2CServiceId[] = ['menage', 'garde-enfants', 'cuisine']

/**
 * Visuel d'en-tête des cartes de service : chaque bannière est livrée en 1408×792 (16:9), en JPEG
 * (repli universel) et en WebP (plus léger), servies via <picture>. Le tiers gauche reste
 * volontairement vide — il est prévu pour un titre en surimpression.
 *
 * Seuls le chemin des fichiers vit ici : la description de l'image (`alt`) est une chaîne lisible,
 * donc traduite — elle appartient aux dictionnaires (`b2c.banners.<id>`). `grand-menage` n'a pas de
 * bannière : son bloc a ses propres affiches.
 */
export type ServiceBanner = { jpg: string; webp: string }

export const SERVICE_BANNERS: Partial<Record<B2CServiceId, ServiceBanner>> = {
  menage: { jpg: '/images/banners/01-menage-a-domicile.jpg', webp: '/images/banners/01-menage-a-domicile.webp' },
  'garde-enfants': { jpg: '/images/banners/02-garde-denfants.jpg', webp: '/images/banners/02-garde-denfants.webp' },
  'personnes-agees': { jpg: '/images/banners/03-aide-personnes-agees.jpg', webp: '/images/banners/03-aide-personnes-agees.webp' },
  cuisine: { jpg: '/images/banners/04-cuisine-a-domicile.jpg', webp: '/images/banners/04-cuisine-a-domicile.webp' },
  gardiennage: { jpg: '/images/banners/05-gardiennage.jpg', webp: '/images/banners/05-gardiennage.webp' },
  chauffeurs: { jpg: '/images/banners/06-chauffeurs.jpg', webp: '/images/banners/06-chauffeurs.webp' },
}

export const GRAND_MENAGE_ID: B2CServiceId = 'grand-menage'

export type B2BSectorId = 'hotels' | 'riads' | 'restaurants' | 'chantiers' | 'commerces' | 'evenements'

export const B2B_SECTOR_IDS: readonly B2BSectorId[] = ['hotels', 'riads', 'restaurants', 'chantiers', 'commerces', 'evenements']

export type B2BFormulaId = 'permanente' | 'temporaire' | 'journalier'

export const B2B_FORMULA_IDS: readonly B2BFormulaId[] = ['permanente', 'temporaire', 'journalier']

export type ProcessStepId = 'ecrit' | 'selection' | 'verification' | 'mise-en-relation'

export const PROCESS_STEP_IDS: readonly ProcessStepId[] = ['ecrit', 'selection', 'verification', 'mise-en-relation']

export type CityId =
  | 'casablanca'
  | 'rabat'
  | 'marrakech'
  | 'fes'
  | 'tanger'
  | 'agadir'
  | 'meknes'
  | 'oujda'
  | 'kenitra'
  | 'sale'
  | 'tetouan'

/** Villes couvertes (fiche officielle), dans l'ordre d'affichage. Les noms traduits sont dans `dict.zones.cities`. */
export const CITY_IDS: readonly CityId[] = [
  'casablanca',
  'rabat',
  'marrakech',
  'fes',
  'tanger',
  'agadir',
  'meknes',
  'oujda',
  'kenitra',
  'sale',
  'tetouan',
]

export type ZoneId = 'casablanca' | 'rabat' | 'marrakech'

/** Quartiers et secteurs prioritaires : seuls les identifiants sont techniques, les libellés sont traduits. */
export const PRIORITY_ZONE_IDS: readonly ZoneId[] = ['casablanca', 'rabat', 'marrakech']

export type B2BNeedId =
  | 'hotel'
  | 'riad'
  | 'restaurant'
  | 'chantier'
  | 'commerce'
  | 'evenement'
  | 'permanente-temporaire-journaliere'
  | 'prospection'
  | 'autre'

/** Besoins proposés par le formulaire de contact, volet Entreprises. */
export const B2B_NEED_IDS: readonly B2BNeedId[] = [
  'hotel',
  'riad',
  'restaurant',
  'chantier',
  'commerce',
  'evenement',
  'permanente-temporaire-journaliere',
  'prospection',
  'autre',
]

export type PricingGroupId = 'menage' | 'nounou' | 'cuisine' | 'garde-malade'

export type FaqItemId =
  | 'delai-profil'
  | 'politique-remplacement'
  | 'paiement-apres-validation'
  | 'contrat-placement'
  | 'langues-parlees'
  | 'zones-couvertes'

export const FAQ_ITEM_IDS: readonly FaqItemId[] = [
  'delai-profil',
  'politique-remplacement',
  'paiement-apres-validation',
  'contrat-placement',
  'langues-parlees',
  'zones-couvertes',
]

/**
 * Grille tarifaire de référence par catégorie.
 * La configuration complète des packs fermes (Particuliers Logée / Non logée, Entreprises B2B
 * et formules Suivi & Garantie) vit dans `lib/packs.ts`.
 */
export const PRICING_GROUPS: ReadonlyArray<{ id: PricingGroupId; rows: ReadonlyArray<{ id: string; price: string }> }> = [
  {
    id: 'menage',
    rows: [
      { id: 'menage-villa', price: '4 500' },
      { id: 'menage-mini-villa', price: '4 000' },
      { id: 'menage-appartement', price: '3 500' },
    ],
  },
  {
    id: 'nounou',
    rows: [
      { id: 'nounou-1', price: '3 500' },
      { id: 'nounou-1-menage', price: '4 000' },
      { id: 'nounou-2-menage', price: '4 500 / 5 000' },
      { id: 'nounou-3', price: '4 500' },
      { id: 'nounou-3-menage', price: '5 000' },
    ],
  },
  {
    id: 'cuisine',
    rows: [
      { id: 'cuisine-simple', price: '4 000' },
      { id: 'cuisine-menage', price: '5 000' },
      { id: 'cuisine-aide', price: '3 500' },
      { id: 'cuisine-aide-menage', price: '4 000' },
    ],
  },
  {
    id: 'garde-malade',
    rows: [
      { id: 'garde-malade-simple', price: '3 500' },
      { id: 'garde-malade-menage', price: '4 000' },
    ],
  },
]

export const CITIES_COUNT = CITY_IDS.length
