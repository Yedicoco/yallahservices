import type { Dictionary } from '@/lib/i18n/dictionaries'

/**
 * Onglets visuels entre l'offre Particuliers (B2C) et l'offre Entreprises (B2B).
 * Ancres HTML simples : aucune JavaScript, navigation instantanée par fragment.
 * Les deux libellés (et le libellé du groupe) viennent du dictionnaire de la langue servie.
 * Le site étant bleu nuit partout, l'onglet actif est le seul aplat or de la pastille.
 */
export function ServicesTabs({ current, dict }: { current: 'particuliers' | 'entreprises'; dict: Dictionary }) {
  const tabs = [
    { id: 'particuliers' as const, label: dict.tabs.particuliers },
    { id: 'entreprises' as const, label: dict.tabs.entreprises },
  ]
  return (
    <nav aria-label={dict.tabs.aria} className="mt-6 inline-flex rounded-full border border-gold/25 bg-navy-deep p-1 text-sm font-semibold">
      {tabs.map((tab) => {
        const active = tab.id === current
        return (
          <a
            key={tab.id}
            href={`#${tab.id}`}
            aria-current={active ? 'true' : undefined}
            className={`rounded-full px-4 py-2 transition ${
              active ? 'bg-gold text-navy' : 'text-stone hover:bg-navy-raised hover:text-gold-soft'
            }`}
          >
            {tab.label}
          </a>
        )
      })}
    </nav>
  )
}
