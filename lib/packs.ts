/**
 * ============================================================================
 * FICHIER DE CONFIGURATION CENTRALISÉ — PACKS, GRILLES SALARIALES & GARANTIES
 * ============================================================================
 *
 * Ce fichier regroupe tous les montants fermes, grilles salariales (« logée »
 * et « non logée »), offres Entreprises (B2B) et formules « Suivi & Garantie ».
 *
 * RÈGLE D'ÉDITION AVANT MISE EN LIGNE :
 *   - Aucun prix ni délai non fourni n'a été inventé.
 *   - Les montants issus de l'affiche officielle Yallah Services (3 500 DH à
 *     5 000 DH) sont pré-remplis comme base de référence sur la colonne
 *     « Logée » et marqués d'un placeholder [À CONFIRMER] afin que vous
 *     validiez la répartition exacte entre « Logée » et « Non logée ».
 *   - Remplacez chaque mention « [À CONFIRMER : …] » par votre valeur finale.
 */

export type AccommodationModeId = 'logee' | 'non_logee'

export type PackGroupId = 'menage' | 'nounou' | 'cuisine' | 'garde-malade'

export type B2CPackConfig = {
  /** Identifiant unique du pack (lié aux libellés traduits dans dictionaries/*.json). */
  id: string
  /** Catégorie de rattachement dans la grille Particuliers. */
  groupId: PackGroupId
  /** Nom commercial du pack (référence éditoriale française). */
  packName: string
  /** Composition détaillée du service inclus dans le pack. */
  composition: string
  /** Options d'hébergement disponibles pour ce pack. */
  modes: readonly AccommodationModeId[]
  /** Unité de facturation / rémunération principale ('mois' | 'semaine'). */
  periodUnit: 'mois' | 'semaine'
  /** Montant de base figurant sur la grille historique Yallah Services (en DH). */
  referenceGridDH: string
  /**
   * Salaire / tarif ferme en formule LOGÉE (24h/24, 1 jour de repos hebdomadaire).
   * Pré-rempli avec le montant de la grille existante + balise [À CONFIRMER].
   */
  priceLogee: string
  /**
   * Salaire / tarif ferme en formule NON LOGÉE (plage horaire journée, jours ouvrés).
   * À renseigner en DH/mois ou DH/semaine avant mise en ligne.
   */
  priceNonLogee: string
}

export type B2BPackConfig = {
  /** Identifiant unique de l'offre Entreprises. */
  id: 'b2b-permanent' | 'b2b-temporaire' | 'b2b-journalier'
  /** Nom du pack Entreprises. */
  packName: string
  /** Composition et périmètre de l'offre B2B. */
  composition: string
  /** Modalité logée / non logée applicable au poste. */
  modeLabel: string
  /** Unité tarifaire ('mois' | 'semaine'). */
  periodUnit: 'mois' | 'semaine'
  /** Tarif ferme B2B (à renseigner avant mise en ligne). */
  price: string
}

export type GuaranteeFormulaConfig = {
  /** Identifiant technique de la formule. */
  id: 'essentielle' | 'serenite'
  /** Mise en avant visuelle (badge « Recommandé »). */
  featured?: boolean
  /** Nom de la formule de suivi et garantie. */
  name: string
  /** Tarif de l'option payante en DH. */
  price: string
  /** Durée pendant laquelle le remplacement est gratuit en cas d'insatisfaction. */
  freeReplacementDuration: string
  /** Niveau et fréquence du suivi inclus. */
  followUpLevel: string
}

export type ServiceAccommodationConfig = {
  serviceId: 'menage' | 'garde-enfants' | 'cuisine' | 'personnes-agees'
  logee: {
    rythme: string
    reposHebdomadaire: string
  }
  nonLogee: {
    plageHoraireType: string
    joursOuvres: string
  }
}

/**
 * Frais de placement / commission d'agence Particuliers (payables uniquement APRÈS validation du profil).
 */
export const AGENCY_PLACEMENT_FEE = '[À CONFIRMER : montant des frais de placement agence en DH — payables après validation]'

/**
 * Configuration des modalités « Logée » et « Non logée » par service concerné (Tâche 5).
 */
export const SERVICE_ACCOMMODATION_CONFIG: Record<
  'menage' | 'garde-enfants' | 'cuisine' | 'personnes-agees',
  ServiceAccommodationConfig
> = {
  menage: {
    serviceId: 'menage',
    logee: {
      rythme: 'Présence 24h/24 à domicile (chambre ou espace dédié)',
      reposHebdomadaire: '1 jour de repos hebdomadaire (24h consécutives) [À CONFIRMER : jour de repos type]',
    },
    nonLogee: {
      plageHoraireType: '[À CONFIRMER : plage horaire type, ex. 08h30 – 17h30]',
      joursOuvres: 'Jours ouvrés (lundi au vendredi / samedi) [À CONFIRMER : 5j/7 ou 6j/7]',
    },
  },
  'garde-enfants': {
    serviceId: 'garde-enfants',
    logee: {
      rythme: 'Présence 24h/24 à domicile auprès des enfants',
      reposHebdomadaire: '1 jour de repos hebdomadaire (24h consécutives) [À CONFIRMER : jour de repos type]',
    },
    nonLogee: {
      plageHoraireType: '[À CONFIRMER : plage horaire type, ex. 08h00 – 18h00]',
      joursOuvres: 'Jours ouvrés selon rythme scolaire et familial [À CONFIRMER : 5j/7 ou 6j/7]',
    },
  },
  cuisine: {
    serviceId: 'cuisine',
    logee: {
      rythme: 'Présence 24h/24 à domicile (service des repas du foyer)',
      reposHebdomadaire: '1 jour de repos hebdomadaire (24h consécutives) [À CONFIRMER : jour de repos type]',
    },
    nonLogee: {
      plageHoraireType: '[À CONFIRMER : plage horaire type, ex. 09h00 – 17h00]',
      joursOuvres: 'Jours ouvrés (préparation déjeuner / dîner) [À CONFIRMER : 5j/7 ou 6j/7]',
    },
  },
  'personnes-agees': {
    serviceId: 'personnes-agees',
    logee: {
      rythme: 'Présence 24h/24 (assistance de jour et veille de nuit)',
      reposHebdomadaire: '1 jour de repos hebdomadaire [À CONFIRMER : jour de repos / relève éventuelle]',
    },
    nonLogee: {
      plageHoraireType: '[À CONFIRMER : plage horaire type de jour ou garde de nuit]',
      joursOuvres: 'Jours ouvrés définis au contrat [À CONFIRMER : 5j/7 ou 6j/7]',
    },
  },
}

/**
 * 1. PACKS PARTICULIERS (B2C) — Salaires fermes mensuels/hebdomadaires « Logée » et « Non logée ».
 *
 * Les montants de la grille existante (3 500 DH à 5 000 DH) sont conservés dans `referenceGridDH`
 * et affichés avec un marqueur explicite [À CONFIRMER] pour valider les salaires exacts en
 * formule « Logée » et en formule « Non logée ».
 */
export const PACKS_PARTICULIERS: readonly B2CPackConfig[] = [
  // --- Groupe 1 : Ménage à domicile ---
  {
    id: 'menage-villa',
    groupId: 'menage',
    packName: 'Pack Ménage Villa',
    composition: 'Ménage complet de villa, entretien quotidien des espaces de vie, linge et repassage',
    modes: ['logee', 'non_logee'],
    periodUnit: 'mois',
    referenceGridDH: '4 500',
    priceLogee: '4 500 DH / mois [À CONFIRMER : salaire logée]',
    priceNonLogee: '[À CONFIRMER : salaire non logée DH/mois ou DH/semaine]',
  },
  {
    id: 'menage-mini-villa',
    groupId: 'menage',
    packName: 'Pack Ménage Mini-Villa',
    composition: 'Ménage régulier de mini-villa, entretien des sols et surfaces, linge et repassage',
    modes: ['logee', 'non_logee'],
    periodUnit: 'mois',
    referenceGridDH: '4 000',
    priceLogee: '4 000 DH / mois [À CONFIRMER : salaire logée]',
    priceNonLogee: '[À CONFIRMER : salaire non logée DH/mois ou DH/semaine]',
  },
  {
    id: 'menage-appartement',
    groupId: 'menage',
    packName: 'Pack Ménage Appartement',
    composition: 'Entretien quotidien ou régulier d’appartement, rangement, nettoyage et repassage',
    modes: ['logee', 'non_logee'],
    periodUnit: 'mois',
    referenceGridDH: '3 500',
    priceLogee: '3 500 DH / mois [À CONFIRMER : salaire logée]',
    priceNonLogee: '[À CONFIRMER : salaire non logée DH/mois ou DH/semaine]',
  },

  // --- Groupe 2 : Nounou (Garde d'enfants) ---
  {
    id: 'nounou-1',
    groupId: 'nounou',
    packName: 'Pack Nounou 1 Enfant',
    composition: 'Garde dédiée d’un enfant, éveil, repas, hygiène et accompagnement quotidien',
    modes: ['logee', 'non_logee'],
    periodUnit: 'mois',
    referenceGridDH: '3 500',
    priceLogee: '3 500 DH / mois [À CONFIRMER : salaire logée]',
    priceNonLogee: '[À CONFIRMER : salaire non logée DH/mois ou DH/semaine]',
  },
  {
    id: 'nounou-1-menage',
    groupId: 'nounou',
    packName: 'Pack Nounou 1 Enfant + Ménage',
    composition: 'Garde d’un enfant combinée à l’entretien courant du domicile et au repassage',
    modes: ['logee', 'non_logee'],
    periodUnit: 'mois',
    referenceGridDH: '4 000',
    priceLogee: '4 000 DH / mois [À CONFIRMER : salaire logée]',
    priceNonLogee: '[À CONFIRMER : salaire non logée DH/mois ou DH/semaine]',
  },
  {
    id: 'nounou-2-menage',
    groupId: 'nounou',
    packName: 'Pack Nounou 2 Enfants + Ménage',
    composition: 'Garde de 2 enfants, suivi des routines quotidiennes et entretien ménager du foyer',
    modes: ['logee', 'non_logee'],
    periodUnit: 'mois',
    referenceGridDH: '4 500 / 5 000',
    priceLogee: '4 500 / 5 000 DH / mois [À CONFIRMER : salaire ferme unique logée]',
    priceNonLogee: '[À CONFIRMER : salaire non logée DH/mois ou DH/semaine]',
  },
  {
    id: 'nounou-3',
    groupId: 'nounou',
    packName: 'Pack Nounou 3 Enfants',
    composition: 'Garde dédiée de 3 enfants, organisation de la journée, repas, bains et activités',
    modes: ['logee', 'non_logee'],
    periodUnit: 'mois',
    referenceGridDH: '4 500',
    priceLogee: '4 500 DH / mois [À CONFIRMER : salaire logée]',
    priceNonLogee: '[À CONFIRMER : salaire non logée DH/mois ou DH/semaine]',
  },
  {
    id: 'nounou-3-menage',
    groupId: 'nounou',
    packName: 'Pack Nounou 3 Enfants + Ménage',
    composition: 'Garde de 3 enfants et prise en charge complète du ménage quotidien du foyer',
    modes: ['logee', 'non_logee'],
    periodUnit: 'mois',
    referenceGridDH: '5 000',
    priceLogee: '5 000 DH / mois [À CONFIRMER : salaire logée]',
    priceNonLogee: '[À CONFIRMER : salaire non logée DH/mois ou DH/semaine]',
  },

  // --- Groupe 3 : Cuisine à domicile ---
  {
    id: 'cuisine-simple',
    groupId: 'cuisine',
    packName: 'Pack Cuisine Simple',
    composition: 'Préparation des repas quotidiens (cuisine marocaine et familiale), gestion et propreté de la cuisine',
    modes: ['logee', 'non_logee'],
    periodUnit: 'mois',
    referenceGridDH: '4 000',
    priceLogee: '4 000 DH / mois [À CONFIRMER : salaire logée]',
    priceNonLogee: '[À CONFIRMER : salaire non logée DH/mois ou DH/semaine]',
  },
  {
    id: 'cuisine-menage',
    groupId: 'cuisine',
    packName: 'Pack Cuisine & Ménage',
    composition: 'Préparation complète des repas combinée à l’entretien ménager intégral du domicile',
    modes: ['logee', 'non_logee'],
    periodUnit: 'mois',
    referenceGridDH: '5 000',
    priceLogee: '5 000 DH / mois [À CONFIRMER : salaire logée]',
    priceNonLogee: '[À CONFIRMER : salaire non logée DH/mois ou DH/semaine]',
  },
  {
    id: 'cuisine-aide',
    groupId: 'cuisine',
    packName: 'Pack Aide-Cuisine',
    composition: 'Préparation des ingrédients, assistance en cuisine, service à table et remise en ordre',
    modes: ['logee', 'non_logee'],
    periodUnit: 'mois',
    referenceGridDH: '3 500',
    priceLogee: '3 500 DH / mois [À CONFIRMER : salaire logée]',
    priceNonLogee: '[À CONFIRMER : salaire non logée DH/mois ou DH/semaine]',
  },
  {
    id: 'cuisine-aide-menage',
    groupId: 'cuisine',
    packName: 'Pack Aide-Cuisine & Ménage',
    composition: 'Assistance quotidienne en cuisine combinée au ménage régulier des pièces de vie',
    modes: ['logee', 'non_logee'],
    periodUnit: 'mois',
    referenceGridDH: '4 000',
    priceLogee: '4 000 DH / mois [À CONFIRMER : salaire logée]',
    priceNonLogee: '[À CONFIRMER : salaire non logée DH/mois ou DH/semaine]',
  },

  // --- Groupe 4 : Garde-malade & Aide aux personnes âgées ---
  {
    id: 'garde-malade-simple',
    groupId: 'garde-malade',
    packName: 'Pack Garde-Malade Simple',
    composition: 'Présence bienveillante, aide à l’autonomie, aide aux repas et accompagnement quotidien',
    modes: ['logee', 'non_logee'],
    periodUnit: 'mois',
    referenceGridDH: '3 500',
    priceLogee: '3 500 DH / mois [À CONFIRMER : salaire logée]',
    priceNonLogee: '[À CONFIRMER : salaire non logée DH/mois ou DH/semaine]',
  },
  {
    id: 'garde-malade-menage',
    groupId: 'garde-malade',
    packName: 'Pack Garde-Malade & Ménage',
    composition: 'Assistance garde-malade au quotidien combinée à l’entretien courant du domicile',
    modes: ['logee', 'non_logee'],
    periodUnit: 'mois',
    referenceGridDH: '4 000',
    priceLogee: '4 000 DH / mois [À CONFIRMER : salaire logée]',
    priceNonLogee: '[À CONFIRMER : salaire non logée DH/mois ou DH/semaine]',
  },
] as const

/**
 * 2. OFFRES & PACKS ENTREPRISES (B2B) — Séparés des packs Particuliers.
 */
export const PACKS_ENTREPRISES: readonly B2BPackConfig[] = [
  {
    id: 'b2b-permanent',
    packName: 'Pack B2B Placement Permanent',
    composition: 'Recrutement et placement durable pour hôtels, riads, restaurants, cliniques et commerces',
    modeLabel: 'Non logée (horaires établissement) ou Logée sur site',
    periodUnit: 'mois',
    price: '[À CONFIRMER : tarif ferme B2B Permanent en DH/mois ou DH/placement]',
  },
  {
    id: 'b2b-temporaire',
    packName: 'Pack B2B Renfort Saisonnier & Temporaire',
    composition: 'Personnel qualifié pour haute saison touristique, remplacement de congé ou surcroît d’activité',
    modeLabel: 'Non logée ou Logée selon établissement',
    periodUnit: 'mois',
    price: '[À CONFIRMER : tarif ferme B2B Saisonnier en DH/mois ou DH/semaine]',
  },
  {
    id: 'b2b-journalier',
    packName: 'Pack B2B Renfort Hebdomadaire & Événementiel',
    composition: 'Équipes opérationnelles pour chantiers, événements, salons et remises en état',
    modeLabel: 'Non logée (plage horaire définie par mission)',
    periodUnit: 'semaine',
    price: '[À CONFIRMER : tarif ferme B2B Renfort en DH/semaine]',
  },
] as const

/**
 * 3. FORMULES « SUIVI & GARANTIE » MONÉTISÉES EN OPTION (Tâche 2).
 */
export const GARANTIE_FORMULAS: readonly GuaranteeFormulaConfig[] = [
  {
    id: 'essentielle',
    featured: false,
    name: 'Formule Garantie Essentielle',
    price: '[À CONFIRMER : montant en DH]',
    freeReplacementDuration: '[À CONFIRMER : durée de remplacement gratuit, ex. X jours / X mois]',
    followUpLevel: '[À CONFIRMER : nombre de remplacements inclus & point de suivi WhatsApp]',
  },
  {
    id: 'serenite',
    featured: true,
    name: 'Formule Garantie Sérénité',
    price: '[À CONFIRMER : montant en DH]',
    freeReplacementDuration: '[À CONFIRMER : durée de remplacement gratuit étendue, ex. X mois]',
    followUpLevel: '[À CONFIRMER : suivi dédié prioritaire, médiation & remplacements sur la période]',
  },
] as const
