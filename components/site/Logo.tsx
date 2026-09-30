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
      {/* Monogramme : pastille or cerclée d'or sur bleu nuit (repli si l'image officielle manque). */}
      <span
        aria-hidden="true"
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg font-black leading-none ring-1 ring-gold/50 ${
          tone === 'light' ? 'bg-gold text-navy' : 'bg-navy-soft text-gold'
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
            className="absolute inset-0 h-full w-full bg-navy-soft object-cover"
          />
        )}
      </span>
      {/* Wordmark : « yallah » en or chaud, « .services » en blanc pur — signature de la charte.
          Le site étant bleu nuit partout, les deux tons partagent le même rendu. */}
      <span className="text-[1.3rem] font-black leading-none tracking-[-0.06em]">
        <span className="text-gold">yallah</span>
        <span className={tone === 'light' ? 'text-paper' : 'text-ink'}>
          <span className="text-gold">.</span>services
        </span>
      </span>
    </span>
  )
}
