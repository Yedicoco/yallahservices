import { ArrowRight, Baby, Car, Check, ChefHat, HeartHandshake, Home, ShieldCheck, SprayCan } from 'lucide-react'
import { B2C_SERVICES, GRAND_MENAGE, type B2CServiceId } from '@/lib/content'
import { WA, whatsappUrl } from '@/lib/whatsapp'
import { WhatsAppLink } from './WhatsAppLink'

const ICONS: Record<B2CServiceId, typeof Home> = {
  menage: Home,
  'garde-enfants': Baby,
  'personnes-agees': HeartHandshake,
  cuisine: ChefHat,
  gardiennage: ShieldCheck,
  chauffeurs: Car,
  'grand-menage': SprayCan,
}

export function Particuliers() {
  const cards = B2C_SERVICES.filter((service) => service.id !== 'grand-menage')
  const grandMenage = B2C_SERVICES.find((service) => service.id === 'grand-menage')!

  return (
    <section id="particuliers" aria-labelledby="titre-particuliers" className="py-16 sm:py-24">
      <div className="container-page">
        <header className="max-w-2xl">
          <p className="eyebrow">Particuliers</p>
          <h2 id="titre-particuliers" className="section-title mt-3">
            Des services à domicile, pensés pour votre quotidien.
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone">
            Ménage, enfants, proches, repas, maison : dites-nous ce dont vous avez besoin, nous vous présentons un profil adapté à votre foyer.
          </p>
        </header>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((service) => {
            const Icon = ICONS[service.id]
            return (
              <li key={service.id} className="flex flex-col rounded-3xl border border-line bg-white/70 p-6 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral/15 text-coral-strong">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-serif text-xl leading-tight">{service.title}</h3>
                <p className="mt-2 flex-1 text-[0.95rem] leading-7 text-stone">{service.description}</p>
                <a
                  href={whatsappUrl(WA.service(service.title))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-wa hover:text-wa-deep"
                >
                  Demander ce service
                  <span className="sr-only"> : {service.title}, sur WhatsApp</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </li>
            )
          })}
        </ul>

        {/* Nettoyage & grand ménage : le service le plus visuel, détaillé d'après les affiches officielles. */}
        <div className="mt-12 grid items-center gap-8 rounded-[2rem] border border-line bg-white p-6 sm:p-8 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:p-10">
          <div>
            <p className="eyebrow">{grandMenage.title}</p>
            <h3 className="mt-3 font-serif text-3xl leading-[1.1] tracking-[-0.02em] sm:text-4xl">{GRAND_MENAGE.title}</h3>
            <p className="mt-4 text-base leading-7 text-ink/85">{grandMenage.description}</p>
            <p className="mt-3 text-base leading-7 text-stone">{GRAND_MENAGE.intro}</p>
            <ul className="mt-5 space-y-2.5">
              {GRAND_MENAGE.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-[0.95rem] font-medium leading-6">
                  <Check size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-wa" />
                  {bullet}
                </li>
              ))}
            </ul>
            <WhatsAppLink message={WA.service(grandMenage.title)} className="mt-7">
              Demander un grand ménage
            </WhatsAppLink>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <figure className="overflow-hidden rounded-2xl border border-line bg-white shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/grand-menage-service.webp"
                alt="Affiche : grand ménage ponctuel ou par semaine pour résidences Airbnb et appartements à Casablanca"
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
                alt="Affiche : besoin d’un grand ménage à Casablanca, nettoyage en profondeur, remise en état Airbnb et entretien régulier"
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
