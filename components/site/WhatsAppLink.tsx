import { whatsappUrl } from '@/lib/whatsapp'
import { WhatsAppIcon } from './icons'

type Variant = 'wa' | 'mint' | 'ink' | 'coral' | 'outline' | 'light' | 'outline-light'

/**
 * Bouton d'appel à l'action vers WhatsApp (canal prioritaire), avec un message pré-rempli
 * adapté au contexte. Le message reste modifiable par le visiteur avant l'envoi.
 */
export function WhatsAppLink({
  message,
  children,
  variant = 'wa',
  icon = true,
  className = '',
}: {
  message: string
  children: React.ReactNode
  variant?: Variant
  icon?: boolean
  className?: string
}) {
  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn btn-${variant} ${className}`.trim()}
    >
      {icon && <WhatsAppIcon className="h-[1.15rem] w-[1.15rem] shrink-0" />}
      <span>{children}</span>
    </a>
  )
}
