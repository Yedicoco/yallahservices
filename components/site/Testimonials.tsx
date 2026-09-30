import { Star } from 'lucide-react'

/**
 * Preuve sociale : trois témoignages de démonstration, réalistes mais synthétiques.
 * AVANT MISE EN LIGNE DÉFINITIVE : à remplacer par de vrais avis clients (prénom, ville, service),
 * conformément à la politique d'avis du site.
 */
const AVIS = [
  {
    quote:
      'J’ai écrit un dimanche soir sur WhatsApp et j’avais déjà des profils proposés le lendemain. La personne choisie est sérieuse, mon domicile est entre de bonnes mains.',
    name: 'Nadia B.',
    city: 'Casablanca',
    service: 'Ménage à domicile',
  },
  {
    quote:
      'Nous cherchions une nounou de confiance à Rabat. L’équipe a pris le temps de comprendre notre rythme avant de nous présenter deux profils. Très réactifs sur WhatsApp.',
    name: 'Karim E.',
    city: 'Rabat',
    service: 'Garde d’enfants',
  },
  {
    quote:
      'Grand ménage avant l’arrivée de locataires Airbnb : communication claire, intervention rapide et résultat impeccable. Je recommande pour la réactivité.',
    name: 'Sofia R.',
    city: 'Casablanca',
    service: 'Nettoyage & grand ménage',
  },
] as const

/** Grille de témoignages : étoiles ambre, mise en page carrousel-compatible (3 cartes égales). */
export function Testimonials() {
  return (
    <section id="avis" aria-labelledby="titre-avis" className="bg-white py-16 sm:py-24">
      <div className="container-page">
        <header className="max-w-2xl">
          <p className="eyebrow">Avis clients</p>
          <h2 id="titre-avis" className="section-title mt-3">
            La confiance, message après message.
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone">
            À Casablanca comme à Rabat, ce que nos clients retiennent d’abord : la réactivité, la clarté et le sentiment d’être bien
            accompagnés.
          </p>
        </header>

        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {AVIS.map((avis) => (
            <li key={avis.name} className="flex flex-col rounded-3xl border border-line bg-sand p-6 shadow-sm">
              <div className="flex items-center gap-1 text-amber" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={17} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <span className="sr-only">Note : 5 sur 5</span>
              <blockquote className="mt-4 flex-1 text-[0.95rem] leading-7 text-ink/85">« {avis.quote} »</blockquote>
              <footer className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint-deep text-sm font-bold text-white">
                  {avis.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-bold">{avis.name}</p>
                  <p className="mt-0.5 text-xs text-stone">
                    {avis.city} · {avis.service}
                  </p>
                </div>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
