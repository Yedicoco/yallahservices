'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NAV_ITEMS } from '@/lib/nav'
import { WA, whatsappUrl } from '@/lib/whatsapp'
import { Logo } from './Logo'
import { WhatsAppIcon } from './icons'

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string>('accueil')

  // Met en évidence la section qui traverse le milieu de l'écran.
  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  // Fermeture du menu mobile : touche Échap, ou passage à la navigation bureau.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    const media = window.matchMedia('(min-width: 1280px)')
    const onMedia = () => media.matches && setOpen(false)
    document.addEventListener('keydown', onKey)
    media.addEventListener('change', onMedia)
    return () => {
      document.removeEventListener('keydown', onKey)
      media.removeEventListener('change', onMedia)
    }
  }, [open])

  const linkClass = (id: string) =>
    `whitespace-nowrap rounded-full px-2.5 py-2 text-[0.8125rem] font-semibold transition-colors ${
      active === id ? 'bg-ink text-paper' : 'text-stone hover:bg-sand hover:text-ink'
    }`

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
        <a href="#accueil" aria-label="Yallah Services, retour à l’accueil" onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center">
          <Logo />
        </a>

        <nav aria-label="Navigation principale" className="hidden items-center gap-0.5 xl:flex">
          {NAV_ITEMS.map((item) => (
            <a key={item.id} href={`#${item.id}`} aria-current={active === item.id ? 'location' : undefined} className={linkClass(item.id)}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl(WA.general)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Écrire à Yallah Services sur WhatsApp"
            className="btn btn-wa btn-sm max-sm:w-11 max-sm:px-0"
          >
            <WhatsAppIcon className="h-[1.15rem] w-[1.15rem]" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink hover:bg-sand xl:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-mobile" aria-label="Menu mobile" className="border-t border-line bg-paper xl:hidden">
          <ul className="container-page flex flex-col gap-1 py-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  aria-current={active === item.id ? 'location' : undefined}
                  className={`flex min-h-12 items-center rounded-xl px-4 text-base font-semibold ${
                    active === item.id ? 'bg-ink text-paper' : 'text-ink hover:bg-sand'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
