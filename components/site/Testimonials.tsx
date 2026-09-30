import { Star } from 'lucide-react'
import { t } from '@/lib/i18n/dictionaries'
import type { Localized } from '@/lib/i18n/props'

const RATING = 5

/**
 * Preuve sociale : trois témoignages de démonstration, réalistes mais synthétiques.
 * AVANT MISE EN LIGNE DÉFINITIVE : à remplacer par de vrais avis clients (prénom, ville, service),
 * conformément à la politique d'avis du site.
 * La ponctuation arabe des guillemets (« … ») est remplacée dans les dictionnaires par « ... ».
 */
export function Testimonials({ dict, locale }: Localized) {

  return (
    <section id="avis" aria-labelledby="titre-avis" className="bg-white py-16 sm:py-24">
      <div className="container-page">
        <header className="max-w-2xl">
          <p className="eyebrow">{dict.testimonials.eyebrow}</p>
          <h2 id="titre-avis" className="section-title mt-3">
            {dict.testimonials.title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone">{dict.testimonials.intro}</p>
        </header>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {dict.testimonials.items.map((avis, index) => (
            <li key={avis.id ?? `avis-${index}`} className="flex flex-col rounded-3xl border border-line bg-sand p-6 shadow-sm">
              <div className="flex items-center gap-1 text-amber" aria-hidden="true">
                {Array.from({ length: RATING }).map((_, star) => (
                  <Star key={star} size={17} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <span className="sr-only">{t(dict.testimonials.ratingSr, { note: RATING, total: RATING })}</span>
              <blockquote className="mt-4 flex-1 text-[0.95rem] leading-7 text-ink/85">{avis.quote}</blockquote>
              <footer className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint-deep text-sm font-bold text-white">
                  {avis.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-bold" lang={dict.meta.languageCode}>
                    {avis.name}
                  </p>
                  <p className="mt-0.5 text-xs text-stone">
                    {avis.city} · {avis.service}
                  </p>
                </div>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
