import type { Dictionary } from './dictionaries'
import type { Locale } from './config'

/**
 * Contrat de traduction des sections de la vitrine.
 *
 * Le choix explicite d'architecture : la langue est résolue UNE fois, dans la page (`app/page.tsx`),
 * puis passée en prop `dict` à chaque section. Aucun contexte React ne franchit la frontière
 * serveur → client dans l'App Router, et passer par un contexte obligerait chaque composant à devenir
 * un Composant Client — ce qui enverrait 100 % du texte dans le bundle JavaScript et rendrait le site
 * dépendant de l'hydratation. Avec la prop :
 *   - le HTML reçu par le navigateur est déjà dans la langue choisie (y compris `dir="rtl"`),
 *   - les sections restent rendues côté serveur (crawlables, accessibles sans JavaScript),
 *   - le TypeScript refuse une section rendue sans dictionnaire.
 */
export type Localized = {
  /** Dictionnaire de la langue servie (français, darija ou anglais). */
  dict: Dictionary
  /** Langue servie : utile pour les attributs `lang`/`dir` isolant une valeur latine dans une phrase arabe. */
  locale: Locale
}
