import type { Dictionary } from './dictionaries'

/**
 * Flèche d'action : en `rtl`, la flèche « vers l'avant » doit pointer vers la gauche.
 * `aria-hidden` est conservé : ces icônes ne portent jamais l'information seule.
 */
export function RtlArrow({ dict, className = '', size = 15 }: { dict?: Pick<Dictionary, 'meta'>; className?: string; size?: number }) {
  const dir = dict?.meta.dir ?? 'ltr'
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={dir === 'rtl' ? { transform: 'scaleX(-1)' } : undefined}
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

/** Nombre/format monétaire : toujours LTR, y compris dans une phrase arabe (isolation bidi, cf. WCAG). */
export function LtrValue({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span dir="ltr" className={className}>
      {children}
    </span>
  )
}
