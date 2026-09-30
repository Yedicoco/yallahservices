import { CITIES_COUNT } from '@/lib/content'
import { t } from '@/lib/i18n/dictionaries'
import { LtrValue } from '@/lib/i18n/react'
import { NAV_IDS, navHref } from '@/lib/nav'
import { LEGAL, SITE } from '@/lib/site'
import { whatsappUrl } from '@/lib/whatsapp'
import { FacebookIcon, InstagramIcon, LinkedInIcon, TikTokIcon, WhatsAppIcon } from './icons'
import { Logo } from './Logo'
import type { Localized } from '@/lib/i18n/props'
import { waMessage } from '@/lib/i18n/dictionaries'

const SOCIALS = [
  { ...SITE.socials.tiktok, Icon: TikTokIcon },
  { ...SITE.socials.instagram, Icon: InstagramIcon },
  { ...SITE.socials.facebook, Icon: FacebookIcon },
  { ...SITE.socials.linkedin, Icon: LinkedInIcon },
] as const

/**
 * Pied de page. Les liens vers la politique de confidentialité et les conditions d'utilisation
 * y sont toujours présents et visibles (exigence de conformité TikTok) ; leurs adresses restent
 * les pages publiées en français, leurs libellés sont traduits.
 */
export function SiteFooter({ dict, locale }: Localized) {
  const baseCity = dict.zones.cities[SITE.baseCity]

  return (
    <footer className="on-dark bg-ink text-paper">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-sm text-sm leading-6 text-paper/75">{dict.structured.description}</p>
          <p className="mt-3 text-sm text-paper/75">{t(dict.brand.cityLine, { ville: baseCity, villes: CITIES_COUNT })}</p>
        </div>

        <nav aria-label={dict.footer.navLabel}>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-paper/60">{dict.footer.navLabel}</h2>
          <ul className="mt-4 space-y-1">
            {NAV_IDS.map((id) => (
              <li key={id}>
                <a href={navHref(id)} className="inline-flex min-h-9 items-center text-sm font-medium text-paper/85 hover:text-amber hover:underline">
                  {dict.nav[id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-paper/60">{dict.footer.contactLabel}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href={whatsappUrl(waMessage(dict, 'general'))}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={dict.common.whatsappAria}
                className="inline-flex min-h-9 items-center gap-2 font-semibold text-paper hover:text-amber"
              >
                <WhatsAppIcon className="h-4 w-4" />
                <LtrValue>{SITE.phoneDisplay}</LtrValue>
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="inline-flex min-h-9 items-center text-paper/85 hover:text-amber hover:underline">
                <LtrValue>{SITE.email}</LtrValue>
              </a>
            </li>
          </ul>
          <ul className="mt-4 flex gap-3">
            {SOCIALS.map(({ id, label, handle, url, Icon }) => (
              <li key={id}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t(dict.footer.followAria, { label, identifiant: handle })}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-paper hover:border-amber hover:text-amber"
                >
                  <Icon className="h-[1.05rem] w-[1.05rem]" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-sm text-paper/75 sm:flex-row sm:items-center sm:justify-between">
          <p>{t(dict.footer.copyright, { annee: new Date().getFullYear(), marque: dict.brand.name, ville: baseCity })}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            <li>
              <a href={LEGAL.privacy.href} className="inline-flex min-h-9 items-center font-medium text-paper underline-offset-4 hover:underline">
                {dict.legal.privacy}
              </a>
            </li>
            <li>
              <a href={LEGAL.terms.href} className="inline-flex min-h-9 items-center font-medium text-paper underline-offset-4 hover:underline">
                {dict.legal.terms}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
