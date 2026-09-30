import { CITIES } from '@/lib/content'
import { NAV_ITEMS } from '@/lib/nav'
import { LEGAL, SITE } from '@/lib/site'
import { WA, whatsappUrl } from '@/lib/whatsapp'
import { FacebookIcon, InstagramIcon, LinkedInIcon, TikTokIcon, WhatsAppIcon } from './icons'
import { Logo } from './Logo'

const SOCIALS = [
  { ...SITE.socials.tiktok, Icon: TikTokIcon },
  { ...SITE.socials.instagram, Icon: InstagramIcon },
  { ...SITE.socials.facebook, Icon: FacebookIcon },
  { ...SITE.socials.linkedin, Icon: LinkedInIcon },
] as const

/**
 * Pied de page. Les liens vers la politique de confidentialité et les conditions d'utilisation
 * y sont toujours présents et visibles (exigence de conformité TikTok).
 */
export function SiteFooter() {
  return (
    <footer className="on-dark bg-ink text-paper">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-sm text-sm leading-6 text-paper/75">{SITE.description}</p>
          <p className="mt-3 text-sm text-paper/75">
            Basés à {SITE.baseCity} · {CITIES.length} villes au Maroc
          </p>
        </div>

        <nav aria-label="Plan du site">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-paper/60">Naviguer</h2>
          <ul className="mt-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="inline-flex min-h-9 items-center text-sm font-medium text-paper/85 hover:text-coral hover:underline">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-paper/60">Contact</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href={whatsappUrl(WA.general)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 items-center gap-2 font-semibold text-paper hover:text-coral"
              >
                <WhatsAppIcon className="h-4 w-4" />
                {SITE.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="inline-flex min-h-9 items-center text-paper/85 hover:text-coral hover:underline">
                {SITE.email}
              </a>
            </li>
          </ul>
          <ul className="mt-4 flex gap-3">
            {SOCIALS.map(({ label, handle, url, Icon }) => (
              <li key={label}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} : ${handle}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-paper hover:border-coral hover:text-coral"
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
          <p>
            © {new Date().getFullYear()} {SITE.name} · {SITE.baseCity}, Maroc
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            <li>
              <a href={LEGAL.privacy.href} className="inline-flex min-h-9 items-center font-medium text-paper underline-offset-4 hover:underline">
                {LEGAL.privacy.label}
              </a>
            </li>
            <li>
              <a href={LEGAL.terms.href} className="inline-flex min-h-9 items-center font-medium text-paper underline-offset-4 hover:underline">
                {LEGAL.terms.label}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
