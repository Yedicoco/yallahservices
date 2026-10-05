'use client'

import { SITE } from '@/lib/site'

/**
 * Logo officiel Yallah Services : l'image fournie par la marque remplace toute icône de plateforme.
 */
export function Logo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      {/* Le logo fourni est affiché directement, sans monogramme de remplacement. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SITE.logoUrl}
        alt="Yallah Services Maroc"
        width={44}
        height={44}
        className={`h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-gold/50 ${tone === 'light' ? 'bg-navy' : 'bg-navy-soft'}`}
      />
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
