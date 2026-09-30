'use client'

/**
 * Bascule de langue : trois pastilles (FR | AR | EN), posées dans l'en-tête.
 *
 *  - `<button>` plutôt que `<select>` : trois choix seulement, état visuel immédiat, et l'ordre
 *    du parcours clavier suit l'ordre de lecture (donc l'ordre inverse en `rtl`, gratuitement) ;
 *  - l'état sélectionné est exposé par `aria-pressed` (et non par une couleur seule) ;
 *  - le libellé affiché reste le code de langue (FR/AR/EN : convention internationale, lisible dans
 *    n'importe quelle langue) ; l'`aria-label` donne le nom complet de la langue cible, écrit dans
 *    SA propre langue (« الدارجة المغربية », « English ») — un lecteur d'écran annonce la bonne
 *    langue, et un malvoyant francophone comme un malvoyant arabophone s'y retrouvent ;
 *  - le changement est persisté (cookie + localStorage) puis appliqué par un re-rendu serveur,
 *    donc le HTML renvoyé est déjà dans la langue choisie (pas de texte français qui clignote).
 */
import { t, type Dictionary } from '@/lib/i18n/dictionaries'
import { useLocaleActions } from '@/lib/i18n/client'
import { LOCALES_META, type Locale } from '@/lib/i18n/config'

type Tone = 'light' | 'dark'

export function LanguageSwitcher({ dict, tone = 'light', className = '' }: { dict: Dictionary; tone?: Tone; className?: string }) {
  // `locale` vient du contexte client (et non d'une prop figée au rendu serveur) : la pastille active
  // doit réagir immédiatement au clic, pendant que le serveur renvoie la page dans la nouvelle langue.
  const { locale, setLocale, pending, options } = useLocaleActions()
  const dark = tone === 'dark'

  const base = `min-h-9 rounded-full px-2.5 text-xs font-bold uppercase tracking-[0.08em] transition-colors focus-visible:outline-offset-2`
  const inactive = dark
    ? 'text-paper/70 hover:bg-white/10 hover:text-paper'
    : 'text-stone hover:bg-mist hover:text-ink'
  const active = dark ? 'bg-paper text-ink' : 'bg-ink text-paper'

  return (
    <div
      role="group"
      aria-label={dict.lang.groupLabel}
      title={dict.lang.hint}
      className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 ${dark ? 'border-white/25' : 'border-line'} ${className}`.trim()}
    >
      {options.map((code: Locale) => {
        const meta = LOCALES_META[code]
        const selected = code === locale
        // « Afficher le site en English » (libellé complet) ; le nom est écrit dans sa propre langue.
        const label = t(dict.lang.switchTo, { langue: meta.nativeName }) || meta.nativeName
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={selected}
            disabled={pending}
            title={`${meta.nativeName} — ${code.toUpperCase()}`}
            aria-label={label}
            className={`${base} ${selected ? active : inactive} ${pending ? 'opacity-60' : ''}`.trim()}
          >
            {meta.short}
          </button>
        )
      })}
    </div>
  )
}
