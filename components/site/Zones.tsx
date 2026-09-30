import { MapPin } from 'lucide-react'
import { CITIES, PRIORITY_AREAS } from '@/lib/content'
import { SITE } from '@/lib/site'
import { WA } from '@/lib/whatsapp'
import { WhatsAppLink } from './WhatsAppLink'

/** Ancrage local : les villes couvertes et les quartiers prioritaires, en badges lisibles. */
export function Zones() {
  return (
    <section id="zones" aria-labelledby="titre-zones" className="bg-sand/60 py-16 sm:py-24">
      <div className="container-page">
        <header className="max-w-2xl">
          <p className="eyebrow">Zones d’intervention</p>
          <h2 id="titre-zones" className="section-title mt-3">
            Présents dans {CITIES.length} villes du Maroc, ancrés à {SITE.baseCity}.
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone">
            Nous sommes basés à {SITE.baseCity} et nous intervenons dans les villes ci-dessous, avec une attention particulière à certains
            quartiers.
          </p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone">Villes couvertes</h3>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {CITIES.map((city) => (
                <li
                  key={city}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold ${
                    city === SITE.baseCity ? 'border-ink bg-ink text-paper' : 'border-line bg-paper text-ink'
                  }`}
                >
                  {city === SITE.baseCity && <MapPin size={14} aria-hidden="true" />}
                  {city}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone">Quartiers et secteurs prioritaires</h3>
            <ul className="mt-4 grid gap-3">
              {PRIORITY_AREAS.map((zone) => (
                <li key={zone.city} className="rounded-2xl border border-line bg-paper p-4">
                  <p className="font-serif text-lg">{zone.label}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {zone.areas.map((area) => (
                      <li key={area} className="rounded-full bg-coral/15 px-3 py-1.5 text-sm font-semibold text-coral-deep">
                        {area}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-line bg-paper p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-[0.95rem] leading-7">
            <strong>Votre quartier n’est pas dans la liste ?</strong> Écrivez-nous : nous confirmons la couverture de votre secteur lors de
            l’échange.
          </p>
          <WhatsAppLink message={WA.zones} className="shrink-0">
            Vérifier mon secteur
          </WhatsAppLink>
        </div>
      </div>
    </section>
  )
}
