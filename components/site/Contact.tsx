import { Mail, MapPin, MessageCircle, Send } from 'lucide-react'
import { CITIES_COUNT } from '@/lib/content'
import { t } from '@/lib/i18n/dictionaries'
import { latinValueAttrs } from '@/lib/i18n/config'
import { LtrValue } from '@/lib/i18n/react'
import { SITE } from '@/lib/site'
import { FacebookIcon, InstagramIcon, LinkedInIcon, TikTokIcon, WhatsAppIcon } from './icons'
import { LeadForm } from './LeadForm'
import { WhatsAppLink } from './WhatsAppLink'
import type { Localized } from '@/lib/i18n/props'

const SOCIALS = [
  { ...SITE.socials.tiktok, Icon: TikTokIcon },
  { ...SITE.socials.instagram, Icon: InstagramIcon },
  { ...SITE.socials.facebook, Icon: FacebookIcon },
  { ...SITE.socials.linkedin, Icon: LinkedInIcon },
] as const

/** Double coche bleue façon WhatsApp (dans les bulles envoyées). */
function Ticks({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`h-3 w-4 shrink-0 ${className}`}>
      <path d="M1 6.5 4.2 10 10.5 2.5" />
      <path d="M7.8 8.6 9.6 10.8 17.6 2.5" />
    </svg>
  )
}

/**
 * Contact : la conversation d'exemple est traduite (elle montre à quoi ressemblera l'échange),
 * les coordonnées restent dans leur forme officielle (isolées en `dir="ltr"` dans une phrase arabe,
 * pour que le numéro ne s'affiche pas à l'envers).
 */
export function Contact({ dict, locale }: Localized) {
  const phoneBidi = latinValueAttrs(locale, SITE.phoneDisplay)
  const baseCity = dict.zones.cities[SITE.baseCity]

  return (
    <section id="contact" aria-labelledby="titre-contact" className="bg-sand py-16 sm:py-24">
      <div className="container-page grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        <div>
          <p className="eyebrow">{dict.contact.eyebrow}</p>
          <h2 id="titre-contact" className="section-title mt-3">
            {dict.contact.title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone">{dict.contact.intro}</p>

          {/* Aperçu de conversation : bulles de discussion officielles, fond vert clair. */}
          <div
            role="img"
            aria-label={dict.contact.chatLabel}
            className="mt-7 overflow-hidden rounded-[1.75rem] border border-line shadow-lg"
            style={{ backgroundColor: '#e9f7ef' }}
          >
            <div className="flex items-center gap-3 bg-wa-deep px-4 py-3 text-white">
              <WhatsAppIcon className="h-6 w-6 shrink-0" />
              <div className="leading-tight">
                <p className="text-sm font-bold">{dict.contact.chatBrand}</p>
                <p className="text-xs text-white/80">{dict.common.online}</p>
              </div>
            </div>

            <div
              className="space-y-2.5 px-4 py-5"
              style={{
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.75) 1px, transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            >
              <p className="text-center text-[11px] font-semibold text-stone">{dict.contact.chatToday}</p>

              {/* Bulle « envoyée » : margin et encoche logiques (`ms-auto`, `rounded-ee`) → miroir exact en rtl. */}
              <div className="ms-auto w-fit max-w-[85%] rounded-2xl rounded-ee-sm bg-[#d9fdd3] px-3.5 py-2.5 shadow-sm">
                <p className="text-[0.9rem] leading-6 text-ink">{dict.contact.chatVisitor}</p>
                <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-stone">
                  <LtrValue>09:41</LtrValue> <Ticks className="text-[#53bdeb]" />
                </p>
              </div>

              <div className="me-auto w-fit max-w-[85%] rounded-2xl rounded-se-sm bg-white px-3.5 py-2.5 shadow-sm">
                <p className="text-[0.9rem] leading-6 text-ink">{dict.contact.chatCompany1}</p>
                <p className="mt-1 text-[10px] text-stone">
                  <LtrValue>09:44</LtrValue>
                </p>
              </div>

              <div className="me-auto w-fit max-w-[85%] rounded-2xl rounded-se-sm bg-white px-3.5 py-2.5 shadow-sm">
                <p className="text-[0.9rem] leading-6 text-ink">{dict.contact.chatCompany2}</p>
                <p className="mt-1 text-[10px] text-stone">
                  <LtrValue>09:45</LtrValue>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-line bg-white px-4 py-3">
              <span className="flex-1 truncate rounded-full bg-sand px-4 py-2 text-sm text-stone">{dict.contact.chatInputPlaceholder}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-wa text-white">
                <Send size={15} aria-hidden="true" />
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs leading-5 text-stone">{dict.contact.chatDisclaimer}</p>

          <WhatsAppLink dict={dict} messageKey="general" className="mt-5 w-full sm:w-auto">
            {t(dict.contact.cta, { numero: SITE.phoneDisplay })}
          </WhatsAppLink>

          <ul className="mt-9 space-y-5">
            <li className="flex items-start gap-4">
              <MessageCircle size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-mint-deep" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-stone">{dict.contact.whatsappChannelLabel}</p>
                <a href={`tel:+${SITE.phoneDigits}`} aria-label={t(dict.contact.callAria, { numero: SITE.phoneDisplay })} {...phoneBidi} className="text-lg font-semibold hover:underline">
                  {SITE.phoneDisplay}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Mail size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-mint-deep" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-stone">{dict.contact.emailLabel}</p>
                <a href={`mailto:${SITE.email}`} {...phoneBidi} className="text-lg font-semibold hover:underline">
                  {SITE.email}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <MapPin size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-mint-deep" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-stone">{t(dict.contact.baseLabel, { ville: baseCity })}</p>
                <p className="text-lg font-semibold">{t(dict.contact.baseDetail, { villes: CITIES_COUNT })}</p>
              </div>
            </li>
          </ul>

          <h3 className="mt-10 text-sm font-bold uppercase tracking-[0.14em] text-stone">{dict.contact.followLabel}</h3>
          <ul className="mt-3 flex flex-wrap gap-2.5">
            {SOCIALS.map(({ id, label, handle, url, Icon }) => (
              <li key={id}>
                <a
                  href={url}
                  aria-label={t(dict.footer.followAria, { label, identifiant: handle })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line bg-white px-4 text-sm font-semibold hover:border-ink"
                >
                  <Icon className="h-4 w-4" />
                  <span lang="fr" dir="ltr">
                    {label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <LeadForm dict={dict} />
      </div>
    </section>
  )
}
