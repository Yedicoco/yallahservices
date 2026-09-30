'use client'

import { useEffect, useRef, useState } from 'react'
import { SITE } from '@/lib/site'

/**
 * Logo : pastille officielle + wordmark texte.
 * Le logo officiel est une image hébergée à l'extérieur (Blob Vercel) : si elle est indisponible,
 * le monogramme « y » placé derrière prend le relais, sans icône d'image cassée.
 * Le wordmark nomme la marque dans tous les cas (l'image est décorative, d'où l'alt vide).
 */
export function Logo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const [failed, setFailed] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  // L'erreur de chargement peut survenir avant l'hydratation : on contrôle l'état réel au montage.
  useEffect(() => {
    const image = imageRef.current
    if (image && image.complete && image.naturalWidth === 0) setFailed(true)
  }, [])

  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg font-black leading-none ${
          tone === 'light' ? 'bg-paper text-ink' : 'bg-ink text-paper'
        }`}
      >
        y
        {!failed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imageRef}
            src={SITE.logoUrl}
            alt=""
            width={36}
            height={36}
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full bg-sand object-cover"
          />
        )}
      </span>
      <span className={`text-[1.3rem] font-black leading-none tracking-[-0.06em] ${tone === 'light' ? 'text-paper' : 'text-ink'}`}>
        yallah<span className="text-coral">.</span>
        <span className={`ms-0.5 ${tone === 'light' ? 'text-paper/70' : 'text-stone'}`}>services</span>
      </span>
    </span>
  )
}
