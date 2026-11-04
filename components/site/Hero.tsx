import { BadgeCheck, Clock, HeartHandshake, MapPin, Wifi } from 'lucide-react'
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
  const trustIcons = [BadgeCheck, Clock, MapPin, HeartHandshake] as const

  return (
    <section
      id="accueil"
      aria-labelledby="titre-accueil"
      className="relative overflow-hidden bg-navy bg-[radial-gradient(130%_90%_at_50%_-10%,#16243f_0%,#0a1128_55%,#060b1a_100%)] pb-32 pt-28 sm:pt-32 lg:pb-40"
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-32 h-[32rem] w-[32rem] rounded-full bg-gold/15 blur-3xl ${side('[inset-inline-end:-10rem]', '[inset-inline-start:-10rem]')}`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 h-72 w-72 rounded-full bg-wa/10 blur-3xl ${side('[inset-inline-start:-8rem]', '[inset-inline-end:-8rem]')}`}
      />

      <div className="container-page relative grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div>
          <p className="eyebrow">{dict.hero.eyebrow}</p>
          <h1
            id="titre-accueil"
            className="mt-4 font-display text-[2.65rem] font-bold uppercase leading-[1.04] tracking-[-0.03em] text-ink sm:text-6xl lg:text-7xl rtl:font-normal rtl:tracking-normal rtl:leading-[1.2]"
          >
            {dict.hero.tagline}
          </h1>
          <span aria-hidden="true" className="mt-6 block h-px w-24 bg-gradient-to-r from-gold to-transparent" />
          <p className="mt-6 text-xl font-semibold leading-7 text-gold-soft sm:text-2xl">{dict.hero.title}</p>
          <p className="mt-5 max-w-xl text-lg leading-8 text-paper/85">{dict.hero.lead}</p>
          <p className="mt-3 max-w-xl text-base leading-7 text-stone">{dict.hero.detail}</p>

          {/* Deux parcours immédiats : le visiteur choisit son besoin avant d’entrer dans le détail. */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <WhatsAppLink dict={dict} messageKey="particulier" variant="gold" className="w-full">
              {dict.hero.ctaParticulier}
            </WhatsAppLink>
            <WhatsAppLink dict={dict} messageKey="entreprise" variant="outline-gold" className="w-full">
              {dict.hero.ctaEntreprise}
            </WhatsAppLink>
          </div>
          <p className="mt-3 text-sm text-stone">{dict.hero.responseNote}</p>

          <ul className="mt-9 grid gap-3 sm:grid-cols-2">
            {trust.map(({ key, label }, index) => {
              const Icon = trustIcons[index % trustIcons.length]
              return (
                <li
                  key={key}
                  className="flex items-center gap-3 rounded-full border border-gold/25 bg-navy-soft/80 px-4 py-2.5 text-sm font-semibold leading-snug text-paper"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-soft ring-1 ring-gold/40"
                  >
                    <Icon size={16} />
                  </span>
                  {label}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div aria-hidden="true" className="absolute -inset-5 rounded-[2.75rem] bg-gradient-to-br from-gold/40 via-gold/5 to-wa/25 blur-2xl" />
          <figure className="relative overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-28px_rgba(0,0,0,0.95)] ring-2 ring-gold">
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
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/75 via-transparent to-transparent" />
          </figure>

          <div className="absolute -bottom-6 [inset-inline-start:-1rem] hidden max-w-[17.5rem] rounded-2xl border border-gold/30 bg-navy-soft p-4 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.95)] sm:block">
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-wa text-wa-ink">
                <WhatsAppIcon className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <p className="text-xs font-bold text-ink">{dict.hero.chatPreviewHeader}</p>
                <p className="flex items-center gap-1 text-[11px] text-wa">
                  <Wifi size={11} aria-hidden="true" /> {dict.common.online}
                </p>
              </div>
            </div>
            <p className="mt-3 rounded-xl rounded-ss-sm bg-navy-raised px-3 py-2 text-xs leading-5 text-paper/90">{dict.hero.chatPreviewMessage}</p>
            <p className="mt-2 text-[11px] font-semibold text-gold-soft">{dict.hero.chatPreviewFooter}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
