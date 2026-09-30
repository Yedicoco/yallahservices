import { Check, HardHat, Hotel, Landmark, PartyPopper, Store, UtensilsCrossed } from 'lucide-react'
import { B2B_FORMULA_IDS, B2B_SECTOR_IDS, type B2BSectorId } from '@/lib/content'
import { RtlArrow } from '@/lib/i18n/react'
import { whatsappUrl } from '@/lib/whatsapp'
import { videosByRubrique } from '@/lib/videos'
import { ServicesTabs } from './ServicesTabs'
import { VideoCard } from './VideoCard'
import { WhatsAppIcon } from './icons'
import { WhatsAppLink } from './WhatsAppLink'
import type { Localized } from '@/lib/i18n/props'
import { waMessage } from '@/lib/i18n/dictionaries'

const ICONS: Record<B2BSectorId, typeof Hotel> = {
  hotels: Hotel,
  riads: Landmark,
  restaurants: UtensilsCrossed,
  chantiers: HardHat,
  commerces: Store,
  evenements: PartyPopper,
}

/**
 * Volet Entreprises (B2B) : bloc sombre nettement séparé du volet Particuliers, accents ambre.
 * Puces communes à toutes les cartes secteurs (`dict.b2b.sectorBullets`), reprises des formules
 * officielles ; chaque carte ouvre WhatsApp avec un message pré-rempli dans la langue du visiteur.
 */
export function Entreprises({ dict, locale }: Localized) {
  const [video] = videosByRubrique('entreprises')

  return (
    <section
      id="entreprises"
      aria-labelledby="titre-entreprises"
      className="on-deep border-t border-gold/20 bg-navy-deep py-16 text-paper sm:py-24"
    >
      <div className="container-page grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
        <div>
          <p className="eyebrow-light">{dict.b2b.eyebrow}</p>
          <h2 id="titre-entreprises" className="section-title mt-3">
            {dict.b2b.title}
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-paper/75">{dict.b2b.intro}</p>
          <ServicesTabs dict={dict} current="entreprises" />

          <h3 className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-gold-soft/80">{dict.b2b.sectorsHeading}</h3>
          {/* Cartes secteurs : icône, titre, puces et action WhatsApp pré-remplie. */}
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {B2B_SECTOR_IDS.map((id) => {
              const sector = dict.b2b.sectors[id]
              const Icon = ICONS[id]
              return (
                <li key={id}>
                  <a
                    href={whatsappUrl(waMessage(dict, 'sector', { besoin: sector.message }))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full flex-col rounded-2xl border border-gold/20 bg-navy-soft p-5 transition duration-300 hover:-translate-y-1 hover:border-gold hover:bg-navy-raised"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 text-gold-soft ring-1 ring-gold/30"
                    >
                      <Icon size={22} />
                    </span>
                    <h4 className="mt-4 font-serif text-lg leading-tight text-ink">{sector.title}</h4>
                    <ul className="mt-2.5 flex-1 space-y-1.5">
                      {dict.b2b.sectorBullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2 text-xs leading-5 text-stone">
                          <Check size={13} aria-hidden="true" className="mt-1 shrink-0 text-gold" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-wa">
                      <WhatsAppIcon className="h-4 w-4" />
                      {dict.b2b.askLabel}
                      <span className="sr-only">{dict.common.onWhatsAppSuffix}</span>
                      <RtlArrow />
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>

          <h3 className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-gold-soft/80">{dict.b2b.formulasHeading}</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {B2B_FORMULA_IDS.map((id) => {
              const formula = dict.b2b.formulas[id]
              return (
                <li key={id} className="rounded-2xl border border-gold/20 border-t-2 border-t-gold bg-navy-soft p-5">
                  <p className="font-serif text-xl text-ink">{formula.title}</p>
                  <p className="mt-2 text-sm leading-6 text-stone">{formula.description}</p>
                </li>
              )
            })}
          </ul>

          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-gold/20 bg-navy-soft p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-serif text-xl text-ink">{dict.b2b.prospection.title}</p>
              <p className="mt-1 max-w-md text-sm leading-6 text-stone">{dict.b2b.prospection.description}</p>
            </div>
            <a
              href={whatsappUrl(waMessage(dict, 'prospection'))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-bold text-gold-soft hover:text-gold-bright"
            >
              {dict.b2b.prospection.cta} <RtlArrow dict={dict} size={16} />
            </a>
          </div>

          <WhatsAppLink dict={dict} messageKey="entreprise" variant="light" className="mt-8">
            {dict.b2b.mainCta}
          </WhatsAppLink>
        </div>

        {video && (
          <div className="mx-auto w-full max-w-[19rem] lg:mx-0 lg:max-w-none">
            <VideoCard video={video} dict={dict} tone="dark" />
          </div>
        )}
      </div>
    </section>
  )
}
