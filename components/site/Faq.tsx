import { ChevronDown, HelpCircle } from 'lucide-react'
import { FAQ_ITEM_IDS } from '@/lib/content'
import { WhatsAppLink } from './WhatsAppLink'
import type { Localized } from '@/lib/i18n/props'

/**
 * FAQ de réassurance en accordéon natif (<details>/<summary>), sans dépendance externe (Tâche 3).
 * Couvre les 6 points clés : délai de proposition, politique de remplacement, paiement après
 * validation (jamais avant), contrat de placement écrit, langues parlées et villes couvertes.
 */
export function Faq({ dict, locale }: Localized) {
  void locale

  return (
    <section id="faq" aria-labelledby="titre-faq" className="border-t border-gold/15 bg-navy py-16 sm:py-24">
      <div className="container-page">
        <header className="max-w-3xl">
          <p className="eyebrow">{dict.faq.eyebrow}</p>
          <h2 id="titre-faq" className="section-title mt-3">
            {dict.faq.title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone">{dict.faq.intro}</p>
        </header>

        <div className="mt-10 space-y-3.5">
          {FAQ_ITEM_IDS.map((id, index) => {
            const item = dict.faq.items[id]
            return (
              <details
                key={id}
                name="yallah-faq"
                open={index === 0}
                className="group overflow-hidden rounded-2xl border border-gold/25 bg-navy-soft transition-colors open:border-gold open:bg-navy-deep"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-start font-serif text-lg font-semibold text-ink transition hover:text-gold-soft sm:px-7 sm:py-5 sm:text-xl [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start gap-3">
                    <HelpCircle size={20} aria-hidden="true" className="mt-1 shrink-0 text-gold" />
                    <span>{item.question}</span>
                  </span>
                  <ChevronDown
                    size={20}
                    aria-hidden="true"
                    className="shrink-0 text-gold-soft transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <div className="border-t border-gold/15 px-5 py-4 text-[0.95rem] leading-7 text-paper/90 sm:px-7 sm:py-5">
                  <p>{item.answer}</p>
                </div>
              </details>
            )
          })}
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-gold/30 bg-navy-soft p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-xl text-ink">{dict.faq.ctaTitle}</p>
            <p className="mt-1 text-sm leading-6 text-stone">{dict.faq.ctaText}</p>
          </div>
          <WhatsAppLink dict={dict} messageKey="general" variant="gold" className="shrink-0">
            {dict.faq.ctaButton}
          </WhatsAppLink>
        </div>
      </div>
    </section>
  )
}
