import { BadgeCheck, HeartHandshake, MapPin } from 'lucide-react'
import { CITIES } from '@/lib/content'
import { SITE } from '@/lib/site'
import { WA } from '@/lib/whatsapp'
import { WhatsAppLink } from './WhatsAppLink'

const TRUST = [
  { icon: BadgeCheck, label: 'Profils vérifiés et sélectionnés' },
  { icon: HeartHandshake, label: 'Accompagnement humain et personnalisé' },
  { icon: MapPin, label: `${CITIES.length} villes couvertes au Maroc` },
] as const

export function Hero() {
  return (
    <section id="accueil" aria-labelledby="titre-accueil" className="relative overflow-hidden pb-16 pt-28 sm:pt-32 lg:pb-24">
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-28 h-[26rem] w-[26rem] rounded-full bg-coral/15 blur-3xl" />
      <div className="container-page relative grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="eyebrow">Yallah Services · Maroc</p>
          <h1 id="titre-accueil" className="mt-4 font-serif text-[2.65rem] leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
            Le bon profil, <span className="italic text-coral-strong">au bon endroit.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-ink/85">{SITE.description}</p>
          <p className="mt-3 max-w-xl text-base leading-7 text-stone">
            Un échange simple sur WhatsApp, une sélection attentive, un accompagnement humain : nous prenons le temps de comprendre votre
            besoin avant de vous présenter le bon profil.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <WhatsAppLink message={WA.particulier} className="sm:min-w-[15.5rem]">
              Je suis un particulier
            </WhatsAppLink>
            <WhatsAppLink message={WA.entreprise} variant="ink" className="sm:min-w-[15.5rem]">
              Je représente une entreprise
            </WhatsAppLink>
          </div>
          <p className="mt-3 text-sm text-stone">Réponse sur WhatsApp · Tarifs et disponibilités confirmés lors de l’échange.</p>

          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-start gap-3 rounded-2xl border border-line bg-white/60 p-4 text-sm font-semibold leading-snug">
                <Icon size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-coral-strong" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Visuel : affiche officielle du grand ménage (version web allégée), affichée sur grand écran uniquement. */}
        <figure className="relative mx-auto hidden w-full max-w-sm rotate-2 overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_30px_60px_-20px_rgba(23,23,23,0.35)] lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/grand-menage-service.webp"
            alt="Affiche Yallah Services : grand ménage ponctuel ou par semaine, pour résidences Airbnb et appartements à Casablanca"
            width={800}
            height={1200}
            loading="lazy"
            decoding="async"
            className="h-auto w-full"
          />
        </figure>
      </div>
    </section>
  )
}
