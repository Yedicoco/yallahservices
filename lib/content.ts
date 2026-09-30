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

export const GRAND_MENAGE_ID: B2CServiceId = 'grand-menage'

export type B2BSectorId = 'hotels' | 'riads' | 'restaurants' | 'chantiers' | 'commerces' | 'evenements'

export const B2B_SECTOR_IDS: readonly B2BSectorId[] = ['hotels', 'riads', 'restaurants', 'chantiers', 'commerces', 'evenements']

export type B2BFormulaId = 'permanente' | 'temporaire' | 'journalier'

export const B2B_FORMULA_IDS: readonly B2BFormulaId[] = ['permanente', 'temporaire', 'journalier']

export type ProcessStepId = 'ecrit' | 'selection' | 'verification' | 'mise-en-relation'

export const PROCESS_STEP_IDS: readonly ProcessStepId[] = ['ecrit', 'selection', 'verification', 'mise-en-relation']

export type CityId = 'casablanca' | 'rabat' | 'marrakech' | 'fes' | 'tanger' | 'agadir' | 'kenitra' | 'mohammedia' | 'temara' | 'sale'

/** Villes couvertes (fiche officielle), dans l'ordre d'affichage. Les noms traduits sont dans `dict.zones.cities`. */
export const CITY_IDS: readonly CityId[] = ['casablanca', 'rabat', 'marrakech', 'fes', 'tanger', 'agadir', 'kenitra', 'mohammedia', 'temara', 'sale']

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

/**
 * Grille tarifaire officielle (montants en dirhams, tels que publiés, à titre indicatif).
 * La grille source ne précise pas de période : aucune unité n'est ajoutée ici.
 * Les libellés de lignes sont traduits via `dict.pricing.rows[rowId]`.
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
