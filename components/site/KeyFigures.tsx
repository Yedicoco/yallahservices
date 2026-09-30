import { BadgeCheck, MapPin, MessageCircle, Timer } from 'lucide-react'
import { LtrValue } from '@/lib/i18n/react'
import type { Localized } from '@/lib/i18n/props'

/**
 * Chiffres clés de réassurance : des indicateurs d'engagement forts mais réalistes
 * pour une entreprise en phase de lancement (moins d'un an d'activité).
 * Aucun volume de missions, aucun chiffre d'affaires, aucune note moyenne inventée.
 * Les valeurs (nombres, ratios) ne sont pas traduites : seuls les libellés le sont.
 */
export function KeyFigures({ dict, locale }: Localized) {
  const flip = locale === 'ar'
  const icons = [MapPin, BadgeCheck, MessageCircle, Timer] as const

  return (
    <section
      aria-label={dict.keyFigures.sectionAria}
      className="relative overflow-hidden border-y border-gold/20 bg-[linear-gradient(135deg,#16243f_0%,#0a1128_55%,#060b1a_100%)] py-14 text-paper sm:py-16"
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-16 h-56 w-56 rounded-full bg-gold/25 blur-3xl ${flip ? '[inset-inline-start:-4rem]' : '[inset-inline-end:-4rem]'}`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-20 h-56 w-56 rounded-full bg-gold/10 blur-3xl ${flip ? '[inset-inline-end:-2.5rem]' : '[inset-inline-start:-2.5rem]'}`}
      />

      <div className="container-page relative">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-soft">{dict.keyFigures.eyebrow}</p>
        <h2 className="mt-3 max-w-2xl font-serif text-2xl leading-tight tracking-[-0.02em] text-ink sm:text-3xl rtl:tracking-normal rtl:leading-snug">
          {dict.keyFigures.title}
        </h2>

        <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dict.keyFigures.items.map((item, index) => {
            const Icon = icons[index % icons.length]
            return (
              <li
                key={item.id ?? `chiffre-${index}`}
                className="rounded-2xl border border-gold/20 bg-navy-soft/70 p-5 backdrop-blur-sm transition hover:border-gold/60"
              >
                <Icon size={22} aria-hidden="true" className="text-gold-soft" />
                {/* Un nombre reste LTR quelle que soit la langue : « < 24h » ne doit pas s'écrire « h24 > ». */}
                <p className="mt-2 text-sm font-bold leading-snug text-paper">{item.label}</p>
                <p className="mt-3 font-serif text-4xl leading-none tracking-tight text-gold">
                  <LtrValue>{item.value}</LtrValue>
                </p>
                <p className="mt-2 text-xs leading-5 text-stone">{item.detail}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
