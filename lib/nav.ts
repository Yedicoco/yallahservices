/**
 * Navigation publique, dans l'ordre demandé :
 * Accueil → Services Particuliers → Services Entreprises → Tarifs & Packs → Suivi & Garantie → Zones d'intervention → Vidéos → FAQ → Contact.
 * Module neutre (ni « use client » ni serveur) : partagé par l'en-tête, le pied de page et les tests.
 *
 * Seuls les ancres et les identifiants vivent ici — les libellés viennent du dictionnaire de la
 * langue courante (`dict.nav[id]`), ce qui permet de traduire la navigation sans toucher au routage.
 * Aucun lien vers l'espace interne (/connect, /api/tiktok/admin/*) ne doit jamais figurer ici.
 */
export const NAV_IDS = ['accueil', 'particuliers', 'entreprises', 'tarifs', 'garantie', 'zones', 'videos', 'faq', 'contact'] as const

/**
 * Identifiant d'ancre = identifiant de libellé (`dict.nav[id]`) : un seul mot-clé, aucune table
 * de correspondance à maintenir, et l'ordre du tableau fait l'ordre d'affichage.
 */
export type NavId = (typeof NAV_IDS)[number]

/** Largeur des ancres : la navigation est traduite, les identifiants HTML ne le sont jamais. */
export const navHref = (id: NavId) => `#${id}`
