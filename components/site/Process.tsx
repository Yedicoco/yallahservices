import { PROCESS_STEP_IDS } from '@/lib/content'
import { t } from '@/lib/i18n/dictionaries'
import type { Localized } from '@/lib/i18n/props'

/** Réassurance : le sérieux du processus (sélection, vérification, accompagnement humain). */
export function Process({ dict, locale }: Localized) {

  return (
    <section id="confiance" aria-labelledby="titre-confiance" className="bg-white py-16 sm:py-24">
      <div className="container-page">
        <header className="max-w-2xl">
          <p className="eyebrow">{dict.process.eyebrow}</p>
          <h2 id="titre-confiance" className="section-title mt-3">
            {dict.process.title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone">{dict.process.intro}</p>
        </header>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEP_IDS.map((id, index) => {
            const step = dict.process.steps.find((candidate) => candidate.id === id) ?? dict.process.steps[index]
            return (
              <li 
                key={id} 
                className="relative rounded-3xl border border-slate-200/80 bg-slate-50/80 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-slate-300/80"
              >
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-mint-deep to-mint-deeper font-display text-xl font-bold text-white ring-4 ring-mint/15 shadow-lg"
                >
                  {index + 1}
                </span>
                <h3 className="mt-5 font-display text-xl font-bold leading-tight">
                  <span className="sr-only">{t(dict.process.stepLabel, { numero: index + 1 })}</span>
                  {step?.title}
                </h3>
                <p className="mt-2 text-[0.95rem] leading-7 text-stone">{step?.description}</p>
              </li>
            )
          })}
        </ol>

        <p className="mt-8 max-w-3xl rounded-2xl border border-amber/40 bg-amber-soft p-5 text-[0.95rem] leading-7 text-ink">
          <strong>{dict.process.noteStrong}</strong>
          {dict.process.noteRest}
        </p>
      </div>
    </section>
  )
}