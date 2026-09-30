import { BadgeCheck, Clock, HeartHandshake, MapPin, Wifi } from 'lucide-react'
import { CITIES } from '@/lib/content'
import { SITE } from '@/lib/site'
import { WA } from '@/lib/whatsapp'
import { WhatsAppIcon } from './icons'
import { WhatsAppLink } from './WhatsAppLink'

/** Puces de réassurance sous le titre : bénéfices vérifiables, sans promesse exagérée. */
const TRUST = [
  { icon: BadgeCheck, label: 'Profils vérifiés et sélectionnés' },
  { icon: Clock, label: 'Réponse sous 2h · 7j/7' },
  { icon: MapPin, label: `${CITIES.length} villes couvertes au Maroc` },
  { icon: HeartHandshake, label: 'Accompagnement humain et personnalisé' },
] as const

export function Hero() {
  return (
    <section id="accueil" aria-labelledby="titre-accueil" className="relative overflow-hidden bg-white pb-20 pt-28 sm:pt-32 lg:pb-28">
      {/* Nappes de couleur : émeraude à droite, ambre à gauche — l'aplat blanc reste dominant. */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-32 h-[32rem] w-[32rem] rounded-full bg-mint/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-1/2 h-72 w-72 rounded-full bg-amber/20 blur-3xl" />

      <div className="container-page relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <p className="eyebrow">Yallah Services · Maroc</p>
          <h1 id="titre-accueil" className="mt-4 font-serif text-[2.65rem] leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
            Le bon profil, <span className="italic text-mint-deep">au bon endroit.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-ink/85">{SITE.description}</p>
          <p className="mt-3 max-w-xl text-base leading-7 text-stone">
            Un échange simple sur WhatsApp, une sélection attentive, un accompagnement humain : nous prenons le temps de comprendre votre
            besoin avant de vous présenter le bon profil.
          </p>

          {/* CTA d'orientation rapide : particuliers / entreprises, avec message pré-rempli. */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <WhatsAppLink message={WA.particulier} variant="mint" className="sm:min-w-[15.5rem]">
              Je suis un particulier
            </WhatsAppLink>
            <WhatsAppLink message={WA.entreprise} variant="ink" className="sm:min-w-[15.5rem]">
              Je représente une entreprise
            </WhatsAppLink>
          </div>
          <p className="mt-3 text-sm text-stone">Réponse sur WhatsApp · Tarifs et disponibilités confirmés lors de l’échange.</p>

          {/* Badges de réassurance : puces stylisées à icône ambre. */}
          <ul className="mt-9 grid gap-3 sm:grid-cols-2">
            {TRUST.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold leading-snug shadow-sm"
              >
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-soft text-amber-deep">
                  <Icon size={16} />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Visuel : montage des professionnels des services (domicile + entreprise) au Maroc. */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div aria-hidden="true" className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-mint/25 via-transparent to-amber/25 blur-2xl" />
          <figure className="relative overflow-hidden rounded-[2rem] border-4 border-white shadow-[0_36px_70px_-24px_rgba(15,23,42,0.45)] ring-1 ring-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-professionals.jpg"
              alt="Illustration : des professionnels des services à domicile et en entreprise au Maroc — personnel de maison, hôtelier, cuisinier et chef d’entreprise."
              width={1408}
              height={768}
              loading="eager"
              decoding="async"
              className="aspect-[4/5] w-full object-cover object-center"
            />
          </figure>

          {/* Bulle d'aperçu WhatsApp : prépare le bloc conversation de la section Contact. */}
          <div className="absolute -bottom-6 -left-4 hidden max-w-[17.5rem] rounded-2xl border border-line bg-white p-4 shadow-xl sm:block">
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-wa text-white">
                <WhatsAppIcon className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <p className="text-xs font-bold">Yallah Services</p>
                <p className="flex items-center gap-1 text-[11px] text-wa">
                  <Wifi size={11} aria-hidden="true" /> en ligne
                </p>
              </div>
            </div>
            <p className="mt-3 rounded-xl rounded-tl-sm bg-mist px-3 py-2 text-xs leading-5 text-ink/90">
              Bonjour Yallah Services, j’aimerais échanger sur mon besoin.
            </p>
            <p className="mt-2 text-[11px] font-semibold text-stone">Réponse sous 2h · 7j/7</p>
          </div>
        </div>
      </div>
    </section>
  )
}
