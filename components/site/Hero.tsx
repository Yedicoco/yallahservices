import { BadgeCheck, Clock, HeartHandshake, MapPin, Wifi, ArrowRight, FileText } from 'lucide-react'
import { CITIES_COUNT } from '@/lib/content'
import { t } from '@/lib/i18n/dictionaries'
import { WhatsAppIcon } from './icons'
import { WhatsAppLink } from './WhatsAppLink'
import type { Localized } from '@/lib/i18n/props'

export function Hero({ dict, locale }: Localized) {
  // Les deux aplats décoratifs sont disposés aux deux extrémités : en `rtl`, on les échange pour que
  // la composition reste équilibrée par rapport au texte (le CSS logique ne couvre pas `inset-*`).
  const flip = locale === 'ar'
  const side = (start: string, end: string) => (flip ? end : start)

  /** Puces de réassurance sous le titre : bénéfices vérifiables, sans promesse exagérée. */
  const trust = dict.hero.trust.map((item, index) => ({
    key: item.id ?? `trust-${index}`,
    label: t(item.label, { villes: CITIES_COUNT }),
  }))
  // Les icônes suivent l'ordre des puces du dictionnaire (BadgeCheck, horloge, carte, main/cura).
  const trustIcons = [BadgeCheck, Clock, MapPin, HeartHandshake] as const

  return (
    <section id="accueil" aria-labelledby="titre-accueil" className="relative overflow-hidden bg-white pb-32 pt-28 sm:pt-32 lg:pb-40">
      {/* Nappes de couleur : émeraude et ambre aux deux extrémités — l'aplat blanc reste dominant. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-32 h-[32rem] w-[32rem] rounded-full bg-mint/20 blur-3xl ${side('[inset-inline-end:-10rem]', '[inset-inline-start:-10rem]')}`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 h-72 w-72 rounded-full bg-amber/20 blur-3xl ${side('[inset-inline-start:-8rem]', '[inset-inline-end:-8rem]')}`}
      />

      <div className="container-page relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <p className="eyebrow">{dict.hero.eyebrow}</p>
          {/* Titre principal = devise de la marque (exigence de la spécification) ; la formulation
              riche en mots-clés reste présente, sous le titre, pour la lecture comme pour l'indexation. */}
          <h1 id="titre-accueil" className="mt-4 font-display font-bold text-[2.65rem] leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-7xl rtl:tracking-normal rtl:leading-[1.2]">
            {dict.hero.tagline}
          </h1>
          <p className="mt-4 text-xl font-semibold leading-7 text-ink/90 sm:text-2xl">{dict.hero.title}</p>
          <p className="mt-6 max-w-xl text-lg leading-8 text-ink/85">{dict.hero.lead}</p>
          <p className="mt-3 max-w-xl text-base leading-7 text-stone">{dict.hero.detail}</p>

          {/* CTA d'orientation rapide : particuliers / entreprises, avec message WhatsApp pré-rempli dans la langue. */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button className="btn btn-mint sm:min-w-[15.5rem] inline-flex items-center justify-center gap-2" aria-label={dict.hero.ctaDevisAria}>
              <FileText className="h-5 w-5" aria-hidden="true" />
              <span>{dict.hero.ctaDevis}</span>
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <WhatsAppLink dict={dict} messageKey="particulier" variant="mint" className="sm:min-w-[15.5rem]">
              <WhatsAppIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              {dict.hero.ctaParticulier}
            </WhatsAppLink>
          </div>
          <p className="mt-3 text-sm text-stone">{dict.hero.responseNote}</p>

          {/* Badges de réassurance : puces stylisées à icône ambre. */}
          <ul className="mt-9 grid gap-3 sm:grid-cols-2">
            {trust.map(({ key, label }, index) => {
              const Icon = trustIcons[index % trustIcons.length]
              return (
                <li
                  key={key}
                  className="flex items-center gap-3 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold leading-snug shadow-sm"
                >
                  <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-soft text-amber-deep">
                    <Icon size={16} />
                  </span>
                  {label}
                </li>
              )
            })}
          </ul>
        </div>

        {/* Visuel : montage des professionnels des services (domicile + entreprise) au Maroc. */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div aria-hidden="true" className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-mint/25 via-transparent to-amber/25 blur-2xl" />
          <figure className="relative overflow-hidden rounded-[2rem] border-4 border-white shadow-[0_36px_70px_-24px_rgba(15,23,42,0.45)] ring-1 ring-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-professionals.jpg"
              alt={dict.hero.imageAlt}
              width={1408}
              height={768}
              loading="eager"
              decoding="async"
              className="aspect-[4/5] w-full object-cover object-center"
            />
          </figure>

          {/* Bulle d'aperçu WhatsApp : prépare le bloc conversation de la section Contact. */}
          <div className="absolute -bottom-6 [inset-inline-start:-1rem] hidden max-w-[17.5rem] rounded-2xl border border-line bg-white p-4 shadow-xl sm:block">
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-wa text-white">
                <WhatsAppIcon className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <p className="text-xs font-bold">{dict.hero.chatPreviewHeader}</p>
                <p className="flex items-center gap-1 text-[11px] text-wa">
                  <Wifi size={11} aria-hidden="true" /> {dict.common.online}
                </p>
              </div>
            </div>
            {/* L'encoche de bulle se met du côté de l'expéditeur : `rounded-ss` suit le sens de lecture. */}
            <p className="mt-3 rounded-xl rounded-ss-sm bg-mist px-3 py-2 text-xs leading-5 text-ink/90">{dict.hero.chatPreviewMessage}</p>
            <p className="mt-2 text-[11px] font-semibold text-stone">{dict.hero.chatPreviewFooter}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
