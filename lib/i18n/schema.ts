/**
 * Structure des dictionnaires (`dictionaries/*.json`).
 *
 * Le type est le contrat commun aux trois langues : `fr.json`, `ar.json` et `en.json` doivent
 * avoir exactement les mêmes clés (contrôlé à la compilation par le moulage explicite dans
 * `dictionaries/index.ts`, et par `pnpm check`). Les tableaux d'itération portent un `id`
 * optionnel : l'ordre des lignes vient toujours du français (source de vérité éditoriale),
 * jamais de l'ordre des clés d'un objet JSON.
 */

export type Localizable = string

/** Sens de lecture du dictionnaire : même domaine que `Direction` dans `lib/i18n/config.ts`. */
export type DictionaryDirection = 'ltr' | 'rtl'

/** Chaîne pouvant porter des marques `{ville}`, `{service}`… remplacées par `t(dict, 'cle', params)`. */
export type Template = string

/* --- Listes ordonnées : identifiants techniques, zéro texte --- */

export type B2CServiceId = 'menage' | 'garde-enfants' | 'personnes-agees' | 'cuisine' | 'gardiennage' | 'chauffeurs' | 'grand-menage'
export type SegmentedB2CServiceId = 'menage' | 'garde-enfants' | 'cuisine'
export type B2BSectorId = 'hotels' | 'riads' | 'restaurants' | 'chantiers' | 'commerces' | 'evenements'
export type B2BFormulaId = 'permanente' | 'temporaire' | 'journalier'
export type NavId = 'accueil' | 'particuliers' | 'entreprises' | 'tarifs' | 'garantie' | 'zones' | 'videos' | 'faq' | 'contact'
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
export type ZoneId = 'casablanca' | 'rabat' | 'marrakech'
export type PricingGroupId = 'menage' | 'nounou' | 'cuisine' | 'garde-malade'
export type B2BPackId = 'b2b-permanent' | 'b2b-temporaire' | 'b2b-journalier'
export type GuaranteeFormulaId = 'essentielle' | 'serenite'
export type FaqItemId =
  | 'delai-profil'
  | 'politique-remplacement'
  | 'paiement-apres-validation'
  | 'contrat-placement'
  | 'langues-parlees'
  | 'zones-couvertes'
export type RubriqueId = 'bon-profil-du-jour' | 'coulisses-et-questions'
export type TestimonialId = 'nadia' | 'karim' | 'sofia'
export type ProcessStepId = 'ecrit' | 'selection' | 'verification' | 'mise-en-relation'

export type Entry = { id?: string; title: Localizable; description: Localizable }
export type Bulleted = Entry & { bullets: readonly Localizable[] }
export type Cta = { cta: Localizable }

export type Dictionary = {
  /** Métadonnées du dictionnaire : servies au SEO et de garde-fou contre une langue mal moulée. */
  meta: {
    locale: string
    languageCode: string
    dir: DictionaryDirection
    ogTitle: Localizable
    metaTitle: Localizable
    metaDescription: Localizable
    metaKeywords: readonly Localizable[]
  }
  brand: { tagline: Localizable; name: Localizable; cityLine: Template }
  common: {
    whatsapp: Localizable
    whatsappAria: Template
    callWa: Localizable
    /** Libellé court du bouton WhatsApp flottant (« Discuter sur WhatsApp »). */
    chatCta: Localizable
    online: Localizable
    onWhatsAppSuffix: Localizable
    hours: Localizable
  }
  skip: { label: Localizable; targetId: string }
  header: { navLabel: Localizable; homeAria: Localizable; openMenu: Localizable; closeMenu: Localizable; mobileNavLabel: Localizable }
  /** Onglets de bascule entre les deux offres (ancres HTML, aucun JavaScript). */
  tabs: { aria: Localizable; particuliers: Localizable; entreprises: Localizable }
  lang: { groupLabel: Localizable; hint: Localizable; aria: Template; switchTo: Template }
  nav: Record<NavId, Localizable>
  hero: {
    eyebrow: Localizable
    /** Devise de la marque : c'est elle qui sert de titre principal (h1), comme l'exige la spécification. */
    tagline: Localizable
    title: Localizable
    lead: Localizable
    detail: Localizable
    ctaParticulier: Localizable
    ctaEntreprise: Localizable
    ctaDevis: Localizable
    ctaDevisAria: Localizable
    responseNote: Localizable
    imageAlt: Localizable
    chatPreviewHeader: Localizable
    chatPreviewMessage: Localizable
    chatPreviewFooter: Localizable
    trust: readonly { id?: string; label: Localizable }[]
  }
  keyFigures: {
    sectionAria: Localizable
    eyebrow: Localizable
    title: Localizable
    items: readonly { id?: string; value: Localizable; label: Localizable; detail: Localizable }[]
  }
  b2c: {
    eyebrow: Localizable
    title: Localizable
    intro: Localizable
    askLabel: Localizable
    services: Record<B2CServiceId, Bulleted>
    /**
     * Segmentation explicite Logée (24h/24, repos hebdomadaire) / Non logée (plage horaire type, jours ouvrés)
     * pour les services Ménage, Nounou et Cuisine (Tâche 5).
     */
    accommodation: {
      heading: Localizable
      logeeBadge: Localizable
      logeeSchedule: Localizable
      nonLogeeBadge: Localizable
      nonLogeeSchedule: Localizable
      services: Record<SegmentedB2CServiceId, { logeeDetail: Localizable; nonLogeeDetail: Localizable }>
    }
    /**
     * Description de la bannière de chaque carte (`alt`). Chemin d'image, lui, technique :
     * il reste dans `SERVICE_BANNERS` (lib/content.ts).
     */
    banners: Partial<Record<B2CServiceId, Localizable>>
    grand: { eyebrow: Localizable; title: Localizable; description: Localizable; intro: Localizable; bullets: readonly Localizable[]; cta: Localizable; posterServiceAlt: Localizable; posterNeedAlt: Localizable }
  }
  b2b: {
    eyebrow: Localizable
    title: Localizable
    intro: Localizable
    sectorsHeading: Localizable
    sectorBullets: readonly Localizable[]
    askLabel: Localizable
    sectors: Record<B2BSectorId, { title: Localizable; message: Localizable }>
    formulasHeading: Localizable
    formulas: Record<B2BFormulaId, Entry>
    prospection: { title: Localizable; description: Localizable; cta: Localizable }
    mainCta: Localizable
  }
  process: {
    eyebrow: Localizable
    title: Localizable
    intro: Localizable
    stepLabel: Template
    steps: readonly { id?: string; title: Localizable; description: Localizable }[]
    noteStrong: Localizable
    noteRest: Localizable
  }
  pricing: {
    eyebrow: Localizable
    title: Localizable
    intro: Localizable
    disclaimer: Localizable
    captionSr: Localizable
    colService: Localizable
    colPrice: Localizable
    colComposition: Localizable
    colMode: Localizable
    colPriceLogee: Localizable
    colPriceNonLogee: Localizable
    logeeLabel: Localizable
    nonLogeeLabel: Localizable
    currency: Localizable
    b2cBadge: Localizable
    b2cTitle: Localizable
    b2cSubtitle: Localizable
    agencyFeeTitle: Localizable
    agencyFeeNote: Localizable
    packs: Record<string, { name: Localizable; composition: Localizable }>
    b2bBadge: Localizable
    b2bTitle: Localizable
    b2bSubtitle: Localizable
    b2bColPack: Localizable
    b2bColMode: Localizable
    b2bColPrice: Localizable
    b2bCta: Localizable
    b2bPacks: Record<B2BPackId, { name: Localizable; composition: Localizable; mode: Localizable }>
    groupsOrder: readonly PricingGroupId[]
    groupTitles: Record<PricingGroupId, Localizable>
    rows: Record<string, Localizable>
    footnote: Localizable
    cta: Localizable
  }
  guarantee: {
    eyebrow: Localizable
    title: Localizable
    intro: Localizable
    recommendedBadge: Localizable
    priceLabel: Localizable
    durationLabel: Localizable
    followUpLabel: Localizable
    contractNote: Localizable
    cta: Localizable
    formulas: Record<GuaranteeFormulaId, { name: Localizable; summary: Localizable; bullets: readonly Localizable[] }>
  }
  faq: {
    eyebrow: Localizable
    title: Localizable
    intro: Localizable
    ctaTitle: Localizable
    ctaText: Localizable
    ctaButton: Localizable
    items: Record<FaqItemId, { question: Localizable; answer: Localizable }>
  }
  employerFilter: {
    badge: Localizable
    formBanner: Localizable
    footerNotice: Localizable
  }
  zones: {
    eyebrow: Localizable
    title: Template
    intro: Template
    citiesHeading: Localizable
    cities: Record<CityId, Localizable>
    areasHeading: Localizable
    zones: readonly { id: ZoneId; label: Localizable; areas: readonly Localizable[] }[]
    unlistedStrong: Localizable
    unlistedRest: Localizable
    cta: Localizable
  }
  videos: {
    eyebrow: Localizable
    title: Localizable
    intro: Localizable
    durationLabel: Template
    cta: Localizable
    playerUnsupported: Localizable
    playerDownload: Localizable
    questionTitle: Localizable
    questionDescription: Localizable
    questionCta: Localizable
    rubriques: Record<RubriqueId, { kicker: Localizable; title: Localizable; description: Localizable; example: Localizable }>
    entries: Record<string, { title: Localizable; description: Localizable }>
    commitments: readonly Localizable[]
  }
  testimonials: {
    eyebrow: Localizable
    title: Localizable
    intro: Localizable
    ratingSr: Template
    items: readonly { id?: string; quote: Localizable; name: Localizable; city: string; service: Localizable }[]
  }
  contact: {
    eyebrow: Localizable
    title: Localizable
    intro: Localizable
    chatLabel: Localizable
    chatBrand: Localizable
    chatToday: Localizable
    chatVisitor: Localizable
    chatCompany1: Localizable
    chatCompany2: Localizable
    chatInputPlaceholder: Localizable
    chatDisclaimer: Localizable
    whatsappChannelLabel: Localizable
    callAria: Template
    emailLabel: Localizable
    baseLabel: Template
    baseDetail: Template
    followLabel: Localizable
    /** Libellé du bouton encadré d'or de l'encart « concierge » (réservation en quelques minutes). */
    reserveCta: Localizable
    /** Phrase d'appui de l'encart « concierge », sous le numéro affiché en or. */
    reserveNote: Localizable
  }
  form: {
    title: Localizable
    intro: Localizable
    tiktokConnected: Localizable
    tiktokConnectedInfo: Localizable
    tiktokContinue: Localizable
    optional: Localizable
    learnMore: Localizable
    notices: { connected: Localizable; denied: Localizable; error: Localizable; unavailable: Localizable }
    segmentLegend: Localizable
    segments: { particulier: Localizable; entreprise: Localizable }
    serviceLabel: Localizable
    needLabel: Localizable
    accommodationLabel: Localizable
    accommodationOptions: {
      logee: Localizable
      nonLogee: Localizable
      aDefinir: Localizable
    }
    placeholderChoose: Localizable
    otherCity: Localizable
    cityLabel: Localizable
    districtLabel: Localizable
    districtPlaceholder: Localizable
    detailsLabel: Localizable
    detailsPlaceholder: Localizable
    b2bNeeds: Record<string, Localizable>
    previewLabel: Localizable
    submit: Localizable
    footnote: Localizable
    logout: Localizable
    message: Template[]
    confirmation: {
      badge: Localizable
      title: Localizable
      subtitle: Localizable
      dossierLabel: Localizable
      summaryTitle: Localizable
      summarySegment: Localizable
      summaryNeed: Localizable
      summaryAccommodation: Localizable
      summaryLocation: Localizable
      summaryDetails: Localizable
      stepsTitle: Localizable
      steps: readonly Localizable[]
      whatsappCta: Template
      editButton: Localizable
    }
  }
  wa: {
    hello: Localizable
    general: Localizable
    particulier: Localizable
    entreprise: Localizable
    tarifs: Localizable
    garantie: Localizable
    zones: Localizable
    question: Localizable
    service: Template
    sector: Template
    prospection: Localizable
    video: Template
  }
  footer: { navLabel: Localizable; contactLabel: Localizable; copyright: Template; followAria: Template }
  legal: { privacy: Localizable; terms: Localizable }
  notFound: { eyebrow: Localizable; title: Localizable; description: Localizable; cta: Localizable; homeAria: Localizable }
  /** Texte de la structuration schema.org (données locales à la langue). */
  structured: { slogan: Localizable; description: Localizable }
}

/** Toutes les clés possibles ne sont pas forcément présentes dans une langue donnée (indexation défensive). */
export type Dict = { [K in keyof Dictionary]: Dictionary[K] }
