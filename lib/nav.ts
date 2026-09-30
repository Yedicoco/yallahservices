/**
 * Navigation publique, dans l'ordre demandé :
 * Accueil → Services Particuliers → Services Entreprises → Tarifs & Grille → Zones d'intervention → Vidéos → Contact.
 * Module neutre (ni « use client » ni serveur) : partagé par l'en-tête et le pied de page.
 * Aucun lien vers l'espace interne (/connect, /api/tiktok/admin/*) ne doit jamais figurer ici.
 */
export const NAV_ITEMS = [
  { id: 'accueil', label: 'Accueil' },
  { id: 'particuliers', label: 'Services Particuliers' },
  { id: 'entreprises', label: 'Services Entreprises' },
  { id: 'tarifs', label: 'Tarifs & Grille' },
  { id: 'zones', label: 'Zones d’intervention' },
  { id: 'videos', label: 'Vidéos' },
  { id: 'contact', label: 'Contact' },
] as const
