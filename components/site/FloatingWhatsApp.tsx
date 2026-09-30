import { whatsappUrl, WA } from '@/lib/whatsapp'
import { WhatsAppIcon } from './icons'

/**
 * Bouton WhatsApp flottant : accès permanent au canal prioritaire, visible en bas de page.
 * Masqué aux lecteurs d'écran sous forme de libellé complet (aria-label), sans doublon sonore.
 */
export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappUrl(WA.general)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 inline-flex min-h-12 items-center gap-2.5 rounded-full bg-wa px-4 py-3 text-sm font-bold text-white shadow-[0_14px_30px_-8px_rgba(14,122,61,0.65)] ring-1 ring-black/10 transition hover:bg-wa-deep focus-visible:outline-offset-4 sm:bottom-6 sm:right-6 sm:px-5"
      aria-label="Écrire à Yallah Services sur WhatsApp — +212 691 733 585"
    >
      <span aria-hidden="true" className="relative flex h-7 w-7 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-white/30 motion-reduce:animate-none" />
        <WhatsAppIcon className="relative h-6 w-6" />
      </span>
      <span aria-hidden="true" className="max-sm:sr-only">
        Discuter sur WhatsApp
      </span>
    </a>
  )
}
