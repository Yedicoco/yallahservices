import Image from 'next/image'
import { Baby, Car, Check, ChefHat, Clock, HeartHandshake, Home, Moon, ShieldCheck, SprayCan } from 'lucide-react'
import {
  B2C_SERVICE_IDS,
  GRAND_MENAGE_ID,
  SEGMENTED_B2C_SERVICE_IDS,
  SERVICE_BANNERS,
  type B2CServiceId,
  type SegmentedB2CServiceId,
} from '@/lib/content'
import { RtlArrow } from '@/lib/i18n/react'
import { whatsappUrl } from '@/lib/whatsapp'
import { ServicesTabs } from './ServicesTabs'
import { WhatsAppIcon } from './icons'
import { WhatsAppLink } from './WhatsAppLink'
import type { Localized } from '@/lib/i18n/props'
import { waMessage } from '@/lib/i18n/dictionaries'

const ICONS: Record<B2CServiceId, typeof Home> = {
  menage: Home,
  'garde-enfants': Baby,
  'personnes-agees': HeartHandshake,
  cuisine: ChefHat,
  gardiennage: ShieldCheck,
  chauffeurs: Car,
  'grand-menage': SprayCan,
}

function isSegmentedService(id: B2CServiceId): id is SegmentedB2CServiceId {
  return (SEGMENTED_B2C_SERVICE_IDS as readonly string[]).includes(id)
}

/**
 * Services Particuliers (B2C) : grille de cartes modernes.
 * Pour les services concernés (ménage, nounou, cuisine), chaque fiche précise explicitement
 * l'option Logée (24h/24, jour de repos hebdomadaire) et Non logée (plage horaire type, jours ouvrés).
 */
export function Particuliers({ dict, locale }: Localized) {
  void locale
  const cards = B2C_SERVICE_IDS.filter((id) => id !== GRAND_MENAGE_ID)
  const grandMenage = dict.b2c.services[GRAND_MENAGE_ID]
  const grand = dict.b2c.grand
  const acc = dict.b2c.accommodation

  return (
    <section id="particuliers" aria-labelledby="titre-particuliers" className="border-t border-gold/15 bg-navy-soft py-16 sm:py-24">
      <div className="container-page">
        <header className="max-w-2xl">
          <p className="eyebrow">{dict.b2c.eyebrow}</p>
          <h2 id="titre-particuliers" className="section-title mt-3">
            {dict.b2c.title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone">{dict.b2c.intro}</p>
          <ServicesTabs dict={dict} current="particuliers" />
        </header>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((id) => {
            const service = dict.b2c.services[id]
            const Icon = ICONS[id]
            const banner = SERVICE_BANNERS[id] ? { ...SERVICE_BANNERS[id]!, alt: dict.b2c.banners[id] ?? '' } : null
            const segmented = isSegmentedService(id) ? acc.services[id] : null

            return (
              <li
                key={id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-gold/20 bg-navy-deep transition duration-300 hover:-translate-y-1 hover:border-gold hover:shadow-[0_32px_64px_-32px_rgba(0,0,0,0.95)]"
              >
                <Image
                  src="/images/hero-professionals.jpg"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="pointer-events-none object-cover opacity-[0.07] transition-opacity duration-300 group-hover:opacity-[0.12]"
                  aria-hidden="true"
                />

                {banner ? (
                  <picture className="relative block">
                    <source srcSet={SERVICE_BANNERS[id]!.webp} type="image/webp" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={SERVICE_BANNERS[id]!.jpg}
                      alt={banner.alt}
                      width={1408}
                      height={792}
                      loading="lazy"
                      decoding="async"
                      className="aspect-video w-full object-cover object-center"
                    />
                  </picture>
                ) : null}

                <div className="relative flex flex-1 flex-col p-6">
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold ring-1 ring-gold/25"
                  >
                    <Icon size={24} />
                  </span>
                  <h3 className="mt-5 font-serif text-xl leading-tight text-ink">{service.title}</h3>
                  <p className="mt-2 text-[0.95rem] leading-7 text-stone">{service.description}</p>
                  <ul className="mt-4 flex-1 space-y-2">
                    {service.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5 text-sm font-medium leading-6 text-paper/85">
                        <Check size={16} aria-hidden="true" className="mt-1 shrink-0 text-gold" />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  {/* Segmentation explicite Logée / Non logée pour Ménage, Nounou et Cuisine (Tâche 5) */}
                  {segmented && (
                    <div className="mt-5 rounded-2xl border border-gold/25 bg-navy-soft p-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-soft">{acc.heading}</p>
                      <div className="mt-2.5 space-y-2.5">
                        <div className="rounded-xl border border-gold/20 bg-navy-deep p-2.5">
                          <p className="flex items-center gap-1.5 text-xs font-bold text-gold-soft">
                            <Moon size={13} aria-hidden="true" className="shrink-0 text-gold" />
                            <span>{acc.logeeBadge}</span>
                            <span className="text-stone">·</span>
                            <span className="text-paper">{acc.logeeSchedule}</span>
                          </p>
                          <p className="mt-1 text-xs leading-5 text-stone">{segmented.logeeDetail}</p>
                        </div>
                        <div className="rounded-xl border border-gold/20 bg-navy-deep p-2.5">
                          <p className="flex items-center gap-1.5 text-xs font-bold text-gold-soft">
                            <Clock size={13} aria-hidden="true" className="shrink-0 text-gold" />
                            <span>{acc.nonLogeeBadge}</span>
                            <span className="text-stone">·</span>
                            <span className="text-paper">{acc.nonLogeeSchedule}</span>
                          </p>
                          <p className="mt-1 text-xs leading-5 text-stone">{segmented.nonLogeeDetail}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <a
                    href={whatsappUrl(waMessage(dict, 'service', { service: service.title }))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-wa-ghost"
                  >
                    <WhatsAppIcon className="h-[1.05rem] w-[1.05rem] shrink-0" />
                    {dict.b2c.askLabel}
                    <span className="sr-only">{dict.common.onWhatsAppSuffix}</span>
                    <RtlArrow dict={dict} className="shrink-0" />
                  </a>
                </div>
              </li>
            )
          })}
        </ul>

        {/* Nettoyage & grand ménage */}
        <div className="mt-12 grid items-center gap-8 rounded-[2rem] border border-gold/25 bg-navy-deep p-6 sm:p-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:p-10">
          <div>
            <p className="eyebrow">{grand.eyebrow}</p>
            <h3 className="mt-3 font-serif text-3xl leading-[1.1] tracking-[-0.02em] sm:text-4xl rtl:tracking-normal rtl:leading-tight">
              {grand.title}
            </h3>
            <p className="mt-4 text-base leading-7 text-paper/85">{grandMenage.description}</p>
            <p className="mt-3 text-base leading-7 text-stone">{grand.intro}</p>
            <ul className="mt-5 space-y-2.5">
              {grand.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-[0.95rem] font-medium leading-6 text-paper/90">
                  <Check size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-gold" />
                  {bullet}
                </li>
              ))}
            </ul>
            <WhatsAppLink dict={dict} messageKey="service" params={{ service: grandMenage.title }} variant="gold" className="mt-7">
              {grand.cta}
            </WhatsAppLink>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <figure className="overflow-hidden rounded-2xl border border-gold/20 bg-navy shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/grand-menage-service.webp"
                alt={grand.posterServiceAlt}
                width={800}
                height={1200}
                loading="lazy"
                decoding="async"
                className="h-auto w-full"
              />
            </figure>
            <figure className="mt-6 overflow-hidden rounded-2xl border border-gold/20 bg-navy shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/grand-menage-besoin.webp"
                alt={grand.posterNeedAlt}
                width={800}
                height={1200}
                loading="lazy"
                decoding="async"
                className="h-auto w-full"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}
