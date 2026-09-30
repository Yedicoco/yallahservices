import type { Dictionary } from '@/lib/i18n/dictionaries'
import { waMessage } from '@/lib/i18n/dictionaries'
import { whatsappUrl } from '@/lib/whatsapp'
import { WhatsAppIcon } from './icons'

type Variant = 'wa' | 'mint' | 'ink' | 'coral' | 'outline' | 'light' | 'outline-light'

/** Clé d'un message pré-rempli traduit (`dict.wa.*`). */
export type WaMessageKey = keyof Dictionary['wa']

/**
 * Bouton d'appel à l'action vers WhatsApp (canal prioritaire).
 *
 * Le message pré-rempli n'est plus écrit en toutes lettres dans le composant : on lui passe une clé
 * du dictionnaire, donc le message ouvert dans WhatsApp est dans la langue que lit le visiteur —
 * darija pour un visiteur arabe, anglais pour un visiteur anglais. Les marques `{service}`,
 * `{video}`, `{besoin}` sont résolues dans la même langue. Le visiteur reste libre de modifier son
 * message avant de l'envoyer.
 *
 * Rendu côté serveur : le lien (href, libellé, sens) est juste dès le premier octet, sans JavaScript.
 */
export function WhatsAppLink({
  messageKey,
  params,
  children,
  dict,
  variant = 'wa',
  icon = true,
  className = '',
}: {
  messageKey: WaMessageKey
  params?: Record<string, string | number>
  children: React.ReactNode
  dict: Dictionary
  variant?: Variant
  icon?: boolean
  className?: string
}) {
  const message = waMessage(dict, messageKey, params)
  const label = typeof children === 'string' ? `${children}${dict.common.onWhatsAppSuffix}` : dict.common.whatsappAria
  return (
    <a
      href={whatsappUrl(message)}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      lang={dict.meta.languageCode}
      dir={dict.meta.dir}
      className={`btn btn-${variant} ${className}`.trim()}
    >
      {icon && <WhatsAppIcon className="h-[1.15rem] w-[1.15rem] shrink-0" />}
      <span>{children}</span>
    </a>
  )
}
