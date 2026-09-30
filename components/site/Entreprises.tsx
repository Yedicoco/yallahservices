import { ArrowRight, Check, HardHat, Hotel, Landmark, PartyPopper, Store, UtensilsCrossed } from 'lucide-react'
import { B2B_FORMULAS, B2B_SECTORS, type B2BSectorId } from '@/lib/content'
import { videosByRubrique } from '@/lib/videos'
import { WA, whatsappUrl } from '@/lib/whatsapp'
import { ServicesTabs } from './ServicesTabs'
import { VideoCard } from './VideoCard'
import { WhatsAppIcon } from './icons'
import { WhatsAppLink } from './WhatsAppLink'

const ICONS: Record<B2BSectorId, typeof Hotel> = {
  hotels: Hotel,
  riads: Landmark,
  restaurants: UtensilsCrossed,
  chantiers: HardHat,
  commerces: Store,
  evenements: PartyPopper,
}

/** Puces communes à toutes les cartes secteurs, reprises des formules officielles. */
const SECTOR_BULLETS = ['Profils vérifiés & identifiés', 'Permanente, temporaire ou journalière'] as const

/** Volet Entreprises (B2B) : bloc sombre nettement séparé du volet Particuliers, accents ambre. */
export function Entreprises() {
  const [video] = videosByRubrique('entreprises')

  return (
    <section id="entreprises" aria-labelledby="titre-entreprises" className="on-dark bg-ink py-16 text-paper sm:py-24">
      <div className="container-page grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
        <div>
          <p className="eyebrow-light">Solutions Entreprises (B2B)</p>
          <h2 id="titre-entreprises" className="section-title mt-3">
            Du personnel fiable, quand votre activité en a besoin.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-paper/75">
            Un hôtel, un restaurant ou un chantier ne peut pas se permettre de rester en sous-effectif. Nous vous aidons à trouver le
            profil adapté à votre besoin.
          </p>
          <ServicesTabs current="entreprises" tone="dark" />

          <h3 className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-paper/60">Secteurs accompagnés</h3>
          {/* Cartes secteurs : icône, titre, puces et action WhatsApp pré-remplie. */}
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {B2B_SECTORS.map((sector) => {
              const Icon = ICONS[sector.id]
              return (
                <li key={sector.id}>
                  <a
                    href={whatsappUrl(WA.sector(sector.message))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-amber/60 hover:bg-white/10"
                  >
                    <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber/15 text-amber">
                      <Icon size={22} />
                    </span>
                    <h4 className="mt-4 font-serif text-lg leading-tight">{sector.title}</h4>
                    <ul className="mt-2.5 flex-1 space-y-1.5">
                      {SECTOR_BULLETS.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2 text-xs leading-5 text-paper/75">
                          <Check size={13} aria-hidden="true" className="mt-1 shrink-0 text-mint-bright" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-mint-bright">
                      <WhatsAppIcon className="h-4 w-4" />
                      Demander du personnel
                      <span className="sr-only"> — {sector.title}, sur WhatsApp</span>
                      <ArrowRight size={15} aria-hidden="true" />
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>

          <h3 className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-paper/60">Main-d’œuvre, pour les entreprises et les porteurs de projets</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {B2B_FORMULAS.map((formula) => (
              <li key={formula.id} className="rounded-2xl border border-t-2 border-t-amber border-white/10 bg-white/5 p-5">
                <p className="font-serif text-xl">{formula.title}</p>
                <p className="mt-2 text-sm leading-6 text-paper/70">{formula.description}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-serif text-xl">Prospection B2B</p>
              <p className="mt-1 max-w-md text-sm leading-6 text-paper/70">
                Yallah Services accompagne aussi les professionnels qui veulent structurer leur développement commercial.
              </p>
            </div>
            <a
              href={whatsappUrl(WA.prospection)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-bold text-amber hover:text-paper"
            >
              En parler sur WhatsApp <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>

          <WhatsAppLink message={WA.entreprise} variant="light" className="mt-8">
            Parler de mon besoin en personnel
          </WhatsAppLink>
        </div>

        {video && (
          <div className="mx-auto w-full max-w-[19rem] lg:mx-0 lg:max-w-none">
            <VideoCard video={video} tone="dark" />
          </div>
        )}
      </div>
    </section>
  )
}
