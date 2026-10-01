import { Building2, Home, ShieldCheck } from 'lucide-react'
import { AGENCY_PLACEMENT_FEE, PACKS_ENTREPRISES, PACKS_PARTICULIERS } from '@/lib/packs'
import { LtrValue } from '@/lib/i18n/react'
import { WhatsAppLink } from './WhatsAppLink'
import type { Localized } from '@/lib/i18n/props'
import type { PricingGroupId } from '@/lib/content'

const GROUP_IDS: readonly PricingGroupId[] = ['menage', 'nounou', 'cuisine', 'garde-malade']

/**
 * Grille tarifaire ferme par pack (Particuliers B2C & Entreprises B2B séparés).
 *
 * Les montants fermes, salaires « Logée » / « Non logée » et placeholders [À CONFIRMER]
 * proviennent exclusivement du fichier de configuration `lib/packs.ts`.
 * Les libellés (noms de packs, compositions, en-têtes) sont traduits via `dict.pricing`.
 */
export function PricingTable({ dict, locale }: Localized) {
  void locale

  return (
    <section id="tarifs" aria-labelledby="titre-tarifs" className="border-t border-gold/15 bg-navy-soft py-16 sm:py-24">
      <div className="container-page">
        <header className="max-w-3xl">
          <p className="eyebrow">{dict.pricing.eyebrow}</p>
          <h2 id="titre-tarifs" className="section-title mt-3">
            {dict.pricing.title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone">{dict.pricing.intro}</p>
        </header>

        {/* ================================================================
            VOLET 1 — PACKS PARTICULIERS (B2C) : LOGÉE & NON LOGÉE
            ================================================================ */}
        <div className="mt-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-gold-soft">
              <Home size={14} aria-hidden="true" />
              {dict.pricing.b2cBadge}
            </span>
            <h3 className="font-serif text-2xl text-ink sm:text-3xl">{dict.pricing.b2cTitle}</h3>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone">{dict.pricing.b2cSubtitle}</p>

          <div className="mt-6 overflow-x-auto rounded-3xl border border-gold/20 bg-navy-deep">
            <table className="w-full min-w-[44rem] border-collapse text-start">
              <caption className="border-b border-gold/30 bg-gold/10 px-5 py-4 text-start text-sm font-semibold leading-6 text-paper sm:px-7">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-gold" />
                  <span>
                    <span className="sr-only">{dict.pricing.captionSr}</span>
                    {dict.pricing.disclaimer}
                  </span>
                </div>
              </caption>
              <thead className="bg-[linear-gradient(90deg,#16243f_0%,#0a1128_100%)] text-gold-soft">
                <tr>
                  <th scope="col" className="px-5 py-4 text-start text-xs font-bold uppercase tracking-[0.12em] sm:px-6">
                    {dict.pricing.colService}
                  </th>
                  <th scope="col" className="px-4 py-4 text-start text-xs font-bold uppercase tracking-[0.12em]">
                    {dict.pricing.colMode}
                  </th>
                  <th scope="col" className="px-4 py-4 text-end text-xs font-bold uppercase tracking-[0.12em]">
                    {dict.pricing.colPriceLogee}
                  </th>
                  <th scope="col" className="px-5 py-4 text-end text-xs font-bold uppercase tracking-[0.12em] sm:px-6">
                    {dict.pricing.colPriceNonLogee}
                  </th>
                </tr>
              </thead>
              {GROUP_IDS.map((groupId, groupIndex) => {
                const groupPacks = PACKS_PARTICULIERS.filter((pack) => pack.groupId === groupId)
                return (
                  <tbody key={groupId}>
                    <tr>
                      <th
                        scope="rowgroup"
                        colSpan={4}
                        className="border-t border-gold/15 bg-navy-raised px-5 py-3.5 text-start text-sm font-bold uppercase tracking-[0.1em] text-gold-soft sm:px-6"
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 text-xs text-gold-soft ring-1 ring-gold/30">
                            {groupIndex + 1}
                          </span>
                          {dict.pricing.groupTitles[groupId]}
                        </div>
                      </th>
                    </tr>
                    {groupPacks.map((pack, rowIndex) => {
                      const packCopy = dict.pricing.packs[pack.id]
                      return (
                        <tr
                          key={pack.id}
                          className={`border-t border-gold/15 align-top transition-colors hover:bg-gold/5 ${rowIndex % 2 === 1 ? 'bg-navy-soft/60' : ''}`}
                        >
                          <th scope="row" className="px-5 py-4 text-start sm:px-6">
                            <p className="text-[0.95rem] font-bold text-ink">{packCopy?.name ?? pack.packName}</p>
                            <p className="mt-1 text-xs font-normal leading-5 text-stone">{packCopy?.composition ?? pack.composition}</p>
                          </th>
                          <td className="px-4 py-4 text-start">
                            <div className="flex flex-col gap-1.5">
                              <span className="inline-flex w-fit items-center rounded-full border border-gold/35 bg-gold/10 px-2.5 py-0.5 text-[11px] font-semibold text-gold-soft">
                                {dict.pricing.logeeLabel}
                              </span>
                              <span className="inline-flex w-fit items-center rounded-full border border-gold/20 bg-navy-raised px-2.5 py-0.5 text-[11px] font-medium text-paper/85">
                                {dict.pricing.nonLogeeLabel}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-end font-semibold tabular-nums text-gold-soft">
                            <span className="inline-block rounded-xl border border-gold/25 bg-navy-raised px-3 py-1.5 text-xs sm:text-sm">
                              <LtrValue>{pack.priceLogee}</LtrValue>
                            </span>
                          </td>
                          <td className="px-5 py-4 text-end font-semibold tabular-nums text-paper/90 sm:px-6">
                            <span className="inline-block rounded-xl border border-gold/20 bg-navy-soft px-3 py-1.5 text-xs sm:text-sm">
                              <LtrValue>{pack.priceNonLogee}</LtrValue>
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                )
              })}
            </table>
          </div>

          {/* Encart Frais de placement agence Particuliers */}
          <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-gold/30 bg-navy-deep p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-sm font-bold text-gold-soft">{dict.pricing.agencyFeeTitle}</p>
              <p className="mt-0.5 text-xs leading-5 text-stone">{dict.pricing.agencyFeeNote}</p>
            </div>
            <p className="rounded-xl border border-gold/30 bg-gold/10 px-3.5 py-2 text-xs font-semibold text-paper sm:text-sm">
              <LtrValue>{AGENCY_PLACEMENT_FEE}</LtrValue>
            </p>
          </div>
        </div>

        {/* ================================================================
            VOLET 2 — OFFRES & PACKS ENTREPRISES (B2B)
            ================================================================ */}
        <div className="mt-14 pt-8 border-t border-gold/20">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-navy-deep px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-gold">
              <Building2 size={14} aria-hidden="true" />
              {dict.pricing.b2bBadge}
            </span>
            <h3 className="font-serif text-2xl text-ink sm:text-3xl">{dict.pricing.b2bTitle}</h3>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone">{dict.pricing.b2bSubtitle}</p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {PACKS_ENTREPRISES.map((b2bPack) => {
              const copy = dict.pricing.b2bPacks[b2bPack.id]
              return (
                <article
                  key={b2bPack.id}
                  className="flex flex-col justify-between rounded-3xl border border-gold/25 bg-navy-deep p-6 transition hover:border-gold"
                >
                  <div>
                    <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold-soft">
                      {copy?.mode ?? b2bPack.modeLabel}
                    </span>
                    <h4 className="mt-4 font-serif text-xl text-ink">{copy?.name ?? b2bPack.packName}</h4>
                    <p className="mt-2 text-sm leading-6 text-stone">{copy?.composition ?? b2bPack.composition}</p>
                  </div>
                  <div className="mt-6 border-t border-gold/15 pt-4">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone">{dict.pricing.b2bColPrice}</p>
                    <p className="mt-1.5 rounded-xl border border-gold/30 bg-navy-raised px-3.5 py-2.5 text-sm font-semibold text-gold-soft">
                      <LtrValue>{b2bPack.price}</LtrValue>
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-6 text-stone">{dict.pricing.footnote}</p>
          <div className="flex flex-wrap gap-3">
            <WhatsAppLink dict={dict} messageKey="tarifs" className="shrink-0">
              {dict.pricing.cta}
            </WhatsAppLink>
            <WhatsAppLink dict={dict} messageKey="entreprise" variant="outline-gold" className="shrink-0">
              {dict.pricing.b2bCta}
            </WhatsAppLink>
          </div>
        </div>
      </div>
    </section>
  )
}
