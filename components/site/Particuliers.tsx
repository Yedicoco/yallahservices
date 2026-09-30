import Image from 'next/image'
import { Baby, Car, Check, ChefHat, HeartHandshake, Home, ShieldCheck, SprayCan } from 'lucide-react'
import { B2C_SERVICE_IDS, GRAND_MENAGE_ID, type B2CServiceId } from '@/lib/content'
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

/**
 * Services Particuliers (B2C) : grille de cartes modernes sur section gris très léger.
 * Les libellés viennent du dictionnaire de la langue servie ; l'ordre des cartes vient de
 * `B2C_SERVICE_IDS` (l'ordre éditorial ne dépend donc pas de l'ordre des clés d'un JSON).
 */
export function Particuliers({ dict, locale }: Localized) {
  const cards = B2C_SERVICE_IDS.filter((id) => id !== GRAND_MENAGE_ID)
  const grandMenage = dict.b2c.services[GRAND_MENAGE_ID]
  const grand = dict.b2c.grand

  return (
    <section id="particuliers" aria-labelledby="titre-particuliers" className="bg-sand py-16 sm:py-24">
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
            return (
              <li
                key={id}
                className="relative flex flex-col overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Image
                  src="/images/hero-professionals.jpg"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="pointer-events-none object-cover opacity-15 backdrop-blur-sm"
                  aria-hidden="true"
                />
                <span
                  aria-hidden="true"
                  className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-soft text-mint-deep ring-1 ring-mint/25"
                >
                  <Icon size={24} />
                </span>
                <h3 className="relative mt-5 font-serif text-xl leading-tight">{service.title}</h3>
                <p className="relative mt-2 text-[0.95rem] leading-7 text-stone">{service.description}</p>
                <ul className="relative mt-4 flex-1 space-y-2">
                  {service.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm font-medium leading-6 text-ink/85">
                      <Check size={16} aria-hidden="true" className="mt-1 shrink-0 text-mint-deep" />
                      {bullet}
                    </li>
                  ))}
                </ul>
                {/* Action rapide : WhatsApp, message pré-rempli nommant le service dans la langue du visiteur. */}
                <a href={whatsappUrl(waMessage(dict, 'service', { service: service.title }))} target="_blank" rel="noopener noreferrer" className="btn-wa-ghost relative">
                  <WhatsAppIcon className="h-[1.05rem] w-[1.05rem] shrink-0" />
                  {dict.b2c.askLabel}
                  <span className="sr-only">{dict.common.onWhatsAppSuffix}</span>
                  <RtlArrow dict={dict} className="shrink-0" />
                </a>
              </li>
            )
          })}
        </ul>

        {/* Nettoyage & grand ménage : le service le plus visuel, détaillé d'après les affiches officielles. */}
        <div className="mt-12 grid items-center gap-8 rounded-[2rem] border border-line bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:p-10">
          <div>
            <p className="eyebrow">{grand.eyebrow}</p>
            <h3 className="mt-3 font-serif text-3xl leading-[1.1] tracking-[-0.02em] sm:text-4xl rtl:tracking-normal rtl:leading-tight">{grand.title}</h3>
            <p className="mt-4 text-base leading-7 text-ink/85">{grandMenage.description}</p>
            <p className="mt-3 text-base leading-7 text-stone">{grand.intro}</p>
            <ul className="mt-5 space-y-2.5">
              {grand.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-[0.95rem] font-medium leading-6">
                  <Check size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-mint-deep" />
                  {bullet}
                </li>
              ))}
            </ul>
            <WhatsAppLink dict={dict} messageKey="service" params={{ service: grandMenage.title }} variant="mint" className="mt-7">
              {grand.cta}
            </WhatsAppLink>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <figure className="overflow-hidden rounded-2xl border border-line bg-white shadow-md">
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
            <figure className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-md">
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
