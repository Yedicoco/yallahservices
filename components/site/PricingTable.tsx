import { Info } from 'lucide-react'
import { PRICING_GROUPS } from '@/lib/content'
import { LtrValue } from '@/lib/i18n/react'
import { WhatsAppLink } from './WhatsAppLink'
import type { Localized } from '@/lib/i18n/props'

/**
 * Grille tarifaire en vrai tableau HTML : lisible sur mobile, accessible (en-têtes associés
 * aux cellules) et indexable par les moteurs de recherche, contrairement à l'ancienne image.
 * La mention « à titre indicatif » fait partie du tableau (légende) et ne peut pas en être séparée.
 *
 * Alignements logiques (`text-start` / `text-end`) : en darija, les libellés s'alignent à droite et
 * les montants à gauche. Les montants eux-mêmes restent en LTR (isolation bidi) : un nombre ne se
 * lit pas à l'envers selon la langue de la phrase.
 */
export function PricingTable({ dict, locale }: Localized) {
  const groups = PRICING_GROUPS

  return (
    <section id="tarifs" aria-labelledby="titre-tarifs" className="border-t border-gold/15 bg-navy-soft py-16 sm:py-24">
      <div className="container-page">
        <header className="max-w-2xl">
          <p className="eyebrow">{dict.pricing.eyebrow}</p>
          <h2 id="titre-tarifs" className="section-title mt-3">
            {dict.pricing.title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone">{dict.pricing.intro}</p>
        </header>

        <div className="mt-8 overflow-hidden rounded-3xl border border-gold/20 bg-navy-deep">
          <table className="w-full border-collapse text-start">
            {/* Mention légale obligatoire, mise en avant par l'accent ambre. */}
            <caption className="border-b border-gold/30 bg-gold/10 px-5 py-4 text-start text-sm font-semibold leading-6 text-paper sm:px-7">
              <div className="flex items-start gap-3">
                <Info size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-gold" />
                <span>
                  <span className="sr-only">{dict.pricing.captionSr}</span>
                  {dict.pricing.disclaimer}
                </span>
              </div>
            </caption>
            <thead className="rounded-t-3xl bg-[linear-gradient(90deg,#16243f_0%,#0a1128_100%)] text-gold-soft">
              <tr>
                <th scope="col" className="px-5 py-4 text-start text-xs font-bold uppercase tracking-[0.14em] sm:px-7">
                  {dict.pricing.colService}
                </th>
                <th scope="col" className="px-5 py-3 text-end text-xs font-bold uppercase tracking-[0.14em] sm:px-7">
                  {dict.pricing.colPrice}
                </th>
              </tr>
            </thead>
            {groups.map((group, groupIndex) => (
              <tbody key={group.id}>
                <tr>
                  <th
                    scope="rowgroup"
                    colSpan={2}
                    className="border-t border-gold/15 bg-navy-raised px-5 py-4 text-start text-sm font-bold uppercase tracking-[0.1em] text-gold-soft sm:px-7"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-gold-soft ring-1 ring-gold/30">
                        {groupIndex + 1}
                      </span>
                      {dict.pricing.groupTitles[group.id]}
                    </div>
                  </th>
                </tr>
                {group.rows.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    className={`border-t border-gold/15 transition-colors hover:bg-gold/5 ${rowIndex % 2 === 1 ? 'bg-navy-soft/60' : ''}`}
                  >
                    <th scope="row" className="px-5 py-4 text-start text-[0.95rem] font-medium text-paper sm:px-7">
                      {dict.pricing.rows[row.id]}
                    </th>
                    <td className="whitespace-nowrap px-5 py-3.5 text-end font-semibold tabular-nums sm:px-7 text-ink/90">
                      <LtrValue>
                        {row.price} <span className="text-xs font-medium text-stone">{dict.pricing.currency}</span>
                      </LtrValue>
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-6 text-stone">{dict.pricing.footnote}</p>
          <WhatsAppLink dict={dict} messageKey="tarifs" className="shrink-0">
            {dict.pricing.cta}
          </WhatsAppLink>
        </div>
      </div>
    </section>
  )
}