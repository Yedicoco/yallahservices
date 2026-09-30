import { MapPin } from 'lucide-react'
import { CITY_IDS, PRIORITY_ZONE_IDS, CITIES_COUNT } from '@/lib/content'
import { SITE } from '@/lib/site'
import { t } from '@/lib/i18n/dictionaries'
import { WhatsAppLink } from './WhatsAppLink'
import type { Localized } from '@/lib/i18n/props'

/** Ancrage local : les villes couvertes et les quartiers prioritaires, en badges lisibles. */
export function Zones({ dict, locale }: Localized) {
  const baseCity = dict.zones.cities[SITE.baseCity]
  const cityLabel = (id: (typeof CITY_IDS)[number]) => dict.zones.cities[id]

  return (
    <section id="zones" aria-labelledby="titre-zones" className="border-t border-gold/15 bg-navy py-16 sm:py-24">
      <div className="container-page">
        <header className="max-w-2xl">
          <p className="eyebrow">{dict.zones.eyebrow}</p>
          <h2 id="titre-zones" className="section-title mt-3">
            {t(dict.zones.title, { villes: CITIES_COUNT, ville: baseCity })}
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone">{t(dict.zones.intro, { ville: baseCity })}</p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-soft/80">{dict.zones.citiesHeading}</h3>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {CITY_IDS.map((id) => (
                <li
                  key={id}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold ${
                    id === SITE.baseCity ? 'border-gold bg-gold text-navy' : 'border-gold/20 bg-navy-soft text-paper hover:border-gold/50'
                  }`}
                >
                  {id === SITE.baseCity && <MapPin size={14} aria-hidden="true" />}
                  {cityLabel(id)}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-soft/80">{dict.zones.areasHeading}</h3>
            <ul className="mt-4 grid gap-3">
              {PRIORITY_ZONE_IDS.map((zoneId) => {
                const zone = dict.zones.zones.find((candidate) => candidate.id === zoneId)
                if (!zone) return null
                return (
                  <li key={zoneId} className="rounded-2xl border border-gold/20 bg-navy-soft p-4">
                    <p className="font-serif text-lg text-ink">{zone.label}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {zone.areas.map((area) => (
                        <li key={area} className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-sm font-semibold text-gold-soft">
                          {area}
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-gold/25 bg-navy-soft p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-[0.95rem] leading-7 text-paper/90">
            <strong>{dict.zones.unlistedStrong}</strong>
            {dict.zones.unlistedRest}
          </p>
          <WhatsAppLink dict={dict} messageKey="zones" className="shrink-0">
            {dict.zones.cta}
          </WhatsAppLink>
        </div>
      </div>
    </section>
  )
}
