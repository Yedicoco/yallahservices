/**
 * Onglets visuels entre l'offre Particuliers (B2C) et l'offre Entreprises (B2B).
 * Ancres HTML simples : aucune JavaScript, navigation instantanée par fragment.
 */
const TABS = [
  { id: 'particuliers', label: 'Particuliers (B2C)' },
  { id: 'entreprises', label: 'Entreprises (B2B)' },
] as const

export function ServicesTabs({ current, tone = 'light' }: { current: (typeof TABS)[number]['id']; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark'
  return (
    <nav aria-label="Choisir une offre : particuliers ou entreprises" className={`mt-6 inline-flex rounded-full border p-1 text-sm font-semibold ${dark ? 'border-white/20 bg-white/5' : 'border-line bg-white shadow-sm'}`}>
      {TABS.map((tab) => {
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
