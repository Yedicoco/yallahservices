import type { Dictionary } from '@/lib/i18n/dictionaries'

/**
 * Onglets visuels entre l'offre Particuliers (B2C) et l'offre Entreprises (B2B).
 * Ancres HTML simples : aucune JavaScript, navigation instantanée par fragment.
 * Les deux libellés (et le libellé du groupe) viennent du dictionnaire de la langue servie.
 */
export function ServicesTabs({ current, dict, tone = 'light' }: { current: 'particuliers' | 'entreprises'; dict: Dictionary; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark'
  const tabs = [
    { id: 'particuliers' as const, label: dict.tabs.particuliers },
    { id: 'entreprises' as const, label: dict.tabs.entreprises },
  ]
  return (
    <nav aria-label={dict.tabs.aria} className={`mt-6 inline-flex rounded-full border p-1 text-sm font-semibold ${dark ? 'border-white/20 bg-white/5' : 'border-line bg-white shadow-sm'}`}>
      {tabs.map((tab) => {
        const active = tab.id === current
        return (
          <a
            key={tab.id}
            href={`#${tab.id}`}
            aria-current={active ? 'true' : undefined}
            className={`rounded-full px-4 py-2 transition ${
              active
                ? dark
                  ? 'bg-paper text-ink'
                  : 'bg-ink text-paper'
                : dark
                  ? 'text-paper/75 hover:text-paper'
                  : 'text-stone hover:text-ink'
            }`}
          >
            {tab.label}
          </a>
        )
      })}
    </nav>
  )
}
