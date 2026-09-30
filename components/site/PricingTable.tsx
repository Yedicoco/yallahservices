import { Info } from 'lucide-react'
import { PRICING_DISCLAIMER, PRICING_GROUPS } from '@/lib/content'
import { WA } from '@/lib/whatsapp'
import { WhatsAppLink } from './WhatsAppLink'

/**
 * Grille tarifaire en vrai tableau HTML : lisible sur mobile, accessible (en-têtes associés
 * aux cellules) et indexable par les moteurs de recherche, contrairement à l'ancienne image.
 * La mention « à titre indicatif » fait partie du tableau (légende) et ne peut pas en être séparée.
 */
export function PricingTable() {
  return (
    <section id="tarifs" aria-labelledby="titre-tarifs" className="bg-sand py-16 sm:py-24">
      <div className="container-page">
        <header className="max-w-2xl">
          <p className="eyebrow">Tarifs &amp; Grille</p>
          <h2 id="titre-tarifs" className="section-title mt-3">
            Des repères clairs pour préparer votre demande.
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone">
            Voici la grille de nos principaux services à domicile. Elle donne un ordre d’idée ; le tarif adapté à votre situation est
            confirmé directement lors de l’échange.
          </p>
        </header>

        <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
          <table className="w-full border-collapse text-left">
            {/* Mention légale obligatoire, mise en avant par l'accent ambre. */}
            <caption className="border-b border-amber/30 bg-amber-soft px-5 py-4 text-left text-sm font-semibold leading-6 sm:px-7">
              <div className="flex items-start gap-3">
                <Info size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-amber-deep" />
                <span>
                  <span className="sr-only">Grille tarifaire des services à domicile. </span>
                  {PRICING_DISCLAIMER}
                </span>
              </div>
            </caption>
            <thead>
              <tr className="bg-mint-deep text-white">
                <th scope="col" className="px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] sm:px-7">
                  Service
                </th>
                <th scope="col" className="px-5 py-3 text-right text-xs font-bold uppercase tracking-[0.14em] sm:px-7">
                  Tarif indicatif (DH)
                </th>
              </tr>
            </thead>
            {PRICING_GROUPS.map((group) => (
              <tbody key={group.title}>
                <tr>
                  <th scope="rowgroup" colSpan={2} className="bg-mist px-5 py-2 text-left text-xs font-bold uppercase tracking-[0.16em] text-mint-deep sm:px-7">
                    {group.title}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.service} className="border-t border-line">
                    <th scope="row" className="px-5 py-3.5 text-[0.95rem] font-medium sm:px-7">
                      {row.service}
                    </th>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums sm:px-7">
                      {row.price} <span className="text-xs font-medium text-stone">DH</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-6 text-stone">
            La durée, les horaires et les modalités sont précisés lors de l’échange. Sans engagement : nous vous orientons honnêtement vers
            le profil qui correspond à votre besoin.
          </p>
          <WhatsAppLink message={WA.tarifs} className="shrink-0">
            Recevoir une estimation adaptée
          </WhatsAppLink>
        </div>
      </div>
    </section>
  )
}
