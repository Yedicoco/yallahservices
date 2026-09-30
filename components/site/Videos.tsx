import { MessagesSquare, ShieldCheck } from 'lucide-react'
import { RUBRIQUES, VIDEO_COMMITMENTS, videosByRubrique } from '@/lib/videos'
import { WA } from '@/lib/whatsapp'
import { VideoCard } from './VideoCard'
import { WhatsAppLink } from './WhatsAppLink'

/**
 * Section Vidéos : deux rubriques prioritaires, répétables dans la durée
 * (mieux vaut deux rendez-vous tenus que sept abandonnés).
 *  1. Le bon profil du jour  : un besoin par ville ou quartier, sans jamais nommer de personne.
 *  2. Coulisses & Vos Questions : le processus de mise en relation et les réponses aux questions WhatsApp.
 * Le volet Entreprises a sa propre vidéo, dans la section Entreprises (jamais mélangé au contenu B2C).
 */
export function Videos() {
  return (
    <section id="videos" aria-labelledby="titre-videos" className="bg-sand py-16 sm:py-24">
      <div className="container-page">
        <header className="max-w-2xl">
          <p className="eyebrow">Vidéos</p>
          <h2 id="titre-videos" className="section-title mt-3">
            Deux rendez-vous pour mieux nous connaître.
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone">
            Des besoins concrets, et les coulisses de la mise en relation : des vidéos courtes, à regarder en quelques secondes.
          </p>
        </header>

        <div className="mt-12 space-y-16 lg:space-y-20">
          {RUBRIQUES.map((rubrique) => {
            const videos = videosByRubrique(rubrique.id)
            return (
              <article key={rubrique.id} aria-labelledby={`rubrique-${rubrique.id}`} className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
                <div>
                  <p className="eyebrow">{rubrique.kicker}</p>
                  <h3 id={`rubrique-${rubrique.id}`} className="mt-3 font-serif text-3xl leading-[1.1] tracking-[-0.02em] sm:text-4xl">
                    {rubrique.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-ink/85">{rubrique.description}</p>
                  <blockquote className="mt-5 border-l-4 border-amber pl-4 font-serif text-lg italic leading-7 text-ink/85">{rubrique.example}</blockquote>
                  <ul className="mt-6 space-y-2.5">
                    {VIDEO_COMMITMENTS.map((commitment) => (
                      <li key={commitment} className="flex items-start gap-3 text-sm font-medium leading-6">
                        <ShieldCheck size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-mint-deep" />
                        {commitment}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {videos.map((video) => (
                    <div key={video.id} className="mx-auto w-full max-w-[20rem] sm:max-w-none">
                      <VideoCard video={video} />
                    </div>
                  ))}
                  {rubrique.id === 'coulisses-et-questions' && (
                    <div className="on-dark mx-auto flex w-full max-w-[20rem] flex-col justify-center gap-8 rounded-3xl bg-ink p-6 text-paper sm:max-w-none">
                      <div>
                        <MessagesSquare size={28} aria-hidden="true" className="text-amber" />
                        <h3 className="mt-4 font-serif text-2xl leading-tight">Une question ?</h3>
                        <p className="mt-2 text-sm leading-6 text-paper/75">
                          Posez-la sur WhatsApp : nous y répondons en vidéo, de façon anonyme, sans jamais citer votre nom.
                        </p>
                      </div>
                      <WhatsAppLink message={WA.question} variant="light">
                        Poser ma question
                      </WhatsAppLink>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
