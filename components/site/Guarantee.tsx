import { Check, RefreshCw, ShieldCheck, Sparkles, UserCheck } from 'lucide-react'
import { GARANTIE_FORMULAS } from '@/lib/packs'
import { LtrValue } from '@/lib/i18n/react'
import { WhatsAppLink } from './WhatsAppLink'
import type { Localized } from '@/lib/i18n/props'

/**
 * Section « Suivi & Garantie » (Tâche 2) : deux formules payantes en option,
 * configurables dans `lib/packs.ts` (nom, prix, durée de remplacement gratuit, niveau de suivi).
 */
export function Guarantee({ dict, locale }: Localized) {
  void locale

  return (
    <section id="garantie" aria-labelledby="titre-garantie" className="border-t border-gold/15 bg-navy py-16 sm:py-24">
      <div className="container-page">
        <header className="max-w-3xl">
          <p className="eyebrow">{dict.guarantee.eyebrow}</p>
          <h2 id="titre-garantie" className="section-title mt-3">
            {dict.guarantee.title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone">{dict.guarantee.intro}</p>
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {GARANTIE_FORMULAS.map((formula) => {
            const copy = dict.guarantee.formulas[formula.id]
            const isFeatured = Boolean(formula.featured)
            return (
              <article
                key={formula.id}
                className={`relative flex flex-col justify-between rounded-3xl border p-6 sm:p-8 transition duration-300 ${
                  isFeatured
                    ? 'border-gold bg-[linear-gradient(160deg,#16243f_0%,#0a1128_65%,#060b1a_100%)] shadow-[0_32px_64px_-32px_rgba(212,175,55,0.35)]'
                    : 'border-gold/25 bg-navy-soft hover:border-gold/60'
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold-soft ring-1 ring-gold/35"
                    >
                      {isFeatured ? <Sparkles size={24} /> : <ShieldCheck size={24} />}
                    </span>
                    {isFeatured && (
                      <span className="inline-flex items-center rounded-full bg-gold px-3.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-navy">
                        {dict.guarantee.recommendedBadge}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-5 font-serif text-2xl leading-tight text-ink sm:text-3xl">{copy.name}</h3>
                  <p className="mt-2 text-[0.95rem] leading-7 text-stone">{copy.summary}</p>

                  {/* Bloc de configuration : Prix, Durée de remplacement gratuit, Niveau de suivi */}
                  <dl className="mt-6 space-y-3 rounded-2xl border border-gold/20 bg-navy-deep p-4 sm:p-5">
                    <div className="flex flex-col gap-1 border-b border-gold/15 pb-3 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-stone">{dict.guarantee.priceLabel}</dt>
                      <dd className="text-sm font-bold text-gold-soft">
                        <LtrValue>{formula.price}</LtrValue>
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-gold/15 pb-3 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-stone">
                        <RefreshCw size={13} aria-hidden="true" className="text-gold" />
                        {dict.guarantee.durationLabel}
                      </dt>
                      <dd className="text-sm font-semibold text-paper">
                        <LtrValue>{formula.freeReplacementDuration}</LtrValue>
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-stone">
                        <UserCheck size={13} aria-hidden="true" className="text-gold" />
                        {dict.guarantee.followUpLabel}
                      </dt>
                      <dd className="text-sm font-semibold text-paper">
                        <LtrValue>{formula.followUpLevel}</LtrValue>
                      </dd>
                    </div>
                  </dl>

                  <ul className="mt-6 space-y-2.5">
                    {copy.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5 text-sm font-medium leading-6 text-paper/90">
                        <Check size={16} aria-hidden="true" className="mt-1 shrink-0 text-gold" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-gold/15">
                  <WhatsAppLink
                    dict={dict}
                    messageKey="garantie"
                    variant={isFeatured ? 'gold' : 'outline-gold'}
                    className="w-full"
                  >
                    {dict.guarantee.cta}
                  </WhatsAppLink>
                </div>
              </article>
            )
          })}
        </div>

        <p className="mt-8 rounded-2xl border border-gold/30 bg-navy-soft p-5 text-sm leading-6 text-paper/90">
          {dict.guarantee.contractNote}
        </p>
      </div>
    </section>
  )
}
