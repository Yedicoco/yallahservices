import { BadgeCheck, MapPin, MessageCircle, Timer } from 'lucide-react'

/**
 * Chiffres clés de réassurance : des indicateurs d'engagement forts mais réalistes
 * pour une entreprise en phase de lancement (moins d'un an d'activité).
 * Aucun volume de missions, aucun chiffre d'affaires, aucune note moyenne inventée.
 */
const FIGURES = [
  { icon: MapPin, value: '+10', label: 'Villes couvertes', detail: 'Casablanca, Rabat, Marrakech, etc.' },
  { icon: BadgeCheck, value: '100%', label: 'Profils vérifiés & identifiés', detail: 'Contrôlés avant de vous être présentés' },
  { icon: MessageCircle, value: '7j/7', label: 'Accompagnement dédié sur WhatsApp', detail: 'Le canal prioritaire de l’équipe' },
  { icon: Timer, value: '< 24h', label: 'Délai moyen de proposition de profil', detail: 'Après la compréhension de votre besoin' },
] as const

/** Bandeau de chiffres clés, en dégradé émeraude : le fort contraste aère la page. */
export function KeyFigures() {
  return (
    <section aria-label="Chiffres clés et engagements" className="relative overflow-hidden bg-gradient-to-br from-mint-deeper via-mint-deep to-[#0f766e] py-14 text-white sm:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

      <div className="container-page relative">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber">Nos engagements, en chiffres</p>
        <h2 className="mt-3 max-w-2xl font-serif text-2xl leading-tight tracking-[-0.02em] sm:text-3xl">
          Des repères concrets, tenus dès le premier jour.
        </h2>

        <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FIGURES.map(({ icon: Icon, value, label, detail }) => (
            <li key={label} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <Icon size={22} aria-hidden="true" className="text-amber" />
              <p className="mt-3 font-serif text-4xl leading-none tracking-tight">{value}</p>
              <p className="mt-2 text-sm font-bold leading-snug">{label}</p>
              <p className="mt-1 text-xs leading-5 text-white/85">{detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
