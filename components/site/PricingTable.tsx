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
    <section id="tarifs" aria-labelledby="titre-tarifs" className="bg-sand py-16 sm:py-24">
      <div className="container-page">
        <header className="max-w-2xl">
          <p className="eyebrow">{dict.pricing.eyebrow}</p>
          <h2 id="titre-tarifs" className="section-title mt-3">
            {dict.pricing.title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone">{dict.pricing.intro}</p>
        </header>

        <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
          <table className="w-full border-collapse text-start">
            {/* Mention légale obligatoire, mise en avant par l'accent ambre. */}
            <caption className="border-b border-amber/30 bg-amber-soft px-5 py-4 text-start text-sm font-semibold leading-6 sm:px-7">
              <div className="flex items-start gap-3">
                <Info size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-deep" />
                <span>
                  <span className="sr-only">{dict.pricing.captionSr}</span>
                  {dict.pricing.disclaimer}
                </span>
              </div>
            </caption>
            <thead>
              <tr className="bg-mint-deep text-white">
                <th scope="col" className="px-5 py-3 text-start text-xs font-bold uppercase tracking-[0.14em] sm:px-7">
                  {dict.pricing.colService}
                </th>
                <th scope="col" className="px-5 py-3 text-end text-xs font-bold uppercase tracking-[0.14em] sm:px-7">
                  {dict.pricing.colPrice}
                </th>
              </tr>
            </thead>
            {groups.map((group) => (
              <tbody key={group.id}>
                <tr>
                  <th scope="rowgroup" colSpan={2} className="bg-mist px-5 py-2 text-start text-xs font-bold uppercase tracking-[0.16em] text-mint-deep sm:px-7">
                    {dict.pricing.groupTitles[group.id]}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <th scope="row" className="px-5 py-3.5 text-start text-[0.95rem] font-medium sm:px-7">
                      {dict.pricing.rows[row.id]}
                    </th>
                    <td className="whitespace-nowrap px-5 py-3.5 text-end font-semibold tabular-nums sm:px-7">
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
