'use client'

/**
 * Fournisseur de langue — seul morceau client de l'i18n de la vitrine, avec la bascule.
 *
 * Il ne traduit rien : les sections reçoivent leur dictionnaire du serveur. Il apporte :
 *   1. la persistance du choix (cookie + localStorage) ;
 *   2. le re-rendu serveur qui applique la nouvelle langue ;
 *   3. l'état « changement de langue en cours », qui voile la page pendant l'échange ;
 *   4. un rattrapage au montage, si le navigateur se souvient d'une langue que le serveur n'a pas
 *      pu connaître (cookie expiré ou effacé) — et la mise à jour immédiate de `<html lang dir>`.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LOCALES, type Locale, documentAttributes, readStoredLocale, writeLocaleCookie, writeStoredLocale } from './config'

export type LocaleActions = {
  /** Langue affichée à l'écran (celle du dernier rendu serveur, ou de son rattrapage). */
  locale: Locale
  /** Change de langue : persiste le choix puis redemande un rendu serveur. */
  setLocale: (locale: Locale) => void
  /** Vrai pendant le re-rendu déclenché par un changement de langue. */
  pending: boolean
  /** Langues proposées à l'interface, dans l'ordre d'affichage (`LOCALES`, figé). */
  options: readonly Locale[]
}

const LocaleActionsContext = createContext<LocaleActions | null>(null)

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const router = useRouter()
  const [current, setCurrent] = useState<Locale>(locale)
  const [pending, startTransition] = useTransition()

  // `lang` et `dir` sont rendus côté serveur sur `<html>` ; on ne les reprend ici qu'en cas de
  // décalage entre le HTML attendu et l'état réel du document (repli localStorage, vu plus bas).
  useEffect(() => {
    const { lang, dir } = documentAttributes(current)
    const root = document.documentElement
    if (root.lang !== lang || root.dir !== dir) {
      root.lang = lang
      root.dir = dir
    }
  }, [current])

  // Le serveur a pu rendre le français (cookie expiré ou effacé, ou première visite sur une route
  // hors matcher) alors que le navigateur se souvient d'une autre langue : on réécrit le cookie puis
  // on redemande un rendu, une seule fois au montage.
  useEffect(() => {
    const stored = readStoredLocale()
    if (stored && stored !== locale) {
      writeLocaleCookie(stored)
      setCurrent(stored)
      startTransition(() => router.refresh())
    }
    // Rattrapage au montage uniquement : ce n'est pas une boucle de synchronisation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === current) return
      writeStoredLocale(next)
      writeLocaleCookie(next)
      setCurrent(next)
      // Le cookie est la source de vérité du rendu (layout, page et métadonnées le lisent) :
      // un seul re-rendu serveur suffit, et il est cohérent par construction.
      startTransition(() => router.refresh())
    },
    [current, router],
  )

  const actions = useMemo<LocaleActions>(() => ({ locale: current, setLocale, pending, options: LOCALES }), [current, setLocale, pending])

  return <LocaleActionsContext.Provider value={actions}>{children}</LocaleActionsContext.Provider>
}

/** Actions de bascule : réservées aux composants client placés sous `LocaleProvider`. */
export function useLocaleActions(): LocaleActions {
  const actions = useContext(LocaleActionsContext)
  if (!actions) throw new Error('useLocaleActions() exige <LocaleProvider> côté client.')
  return actions
}

/**
 * Voile discret posé sur le document pendant qu'un changement de langue est en cours : la page est
 * renvoyée par le serveur, et ce léger fondu évite de lire deux langues en une seconde.
 * Purement cosmétique (`prefers-reduced-motion` respecté) — aucun contenu n'en dépend.
 */
export function LocaleRefreshVeil() {
  const { pending } = useLocaleActions()
  useEffect(() => {
    document.documentElement.classList.toggle('locale-switching', pending)
    if (!pending) return () => undefined
    return () => document.documentElement.classList.remove('locale-switching')
  }, [pending])
  return null
}
