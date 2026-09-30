'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NAV_IDS, navHref } from '@/lib/nav'
import { whatsappUrl } from '@/lib/whatsapp'
import { Logo } from './Logo'
import { WhatsAppIcon } from './icons'
import { LanguageSwitcher } from './LanguageSwitcher'
import type { Localized } from '@/lib/i18n/props'
import { waMessage } from '@/lib/i18n/dictionaries'

export function SiteHeader({ dict, locale }: Localized) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string>('accueil')
  // Libellés et aria-labels viennent du dictionnaire de la langue servie.
  const navLabel = (id: (typeof NAV_IDS)[number]) => dict.nav[id]

  // Determine active section from URL hash first (explicit navigation), then fallback to scroll position.
  // 'entreprises' should only be active when URL hash is #entreprises (explicit click), not on scroll.
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash && NAV_IDS.includes(hash as (typeof NAV_IDS)[number])) {
      setActive(hash)
    }
  }, [])

  // IntersectionObserver for scroll-based highlighting — EXCLUDE 'entreprises' so it only activates on explicit hash.
  useEffect(() => {
    const scrollNavIds = NAV_IDS.filter((id) => id !== 'entreprises')
    const sections = scrollNavIds.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  // Update active on hash change (explicit navigation)
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash && NAV_IDS.includes(hash as (typeof NAV_IDS)[number])) {
        setActive(hash)
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
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
    `whitespace-nowrap rounded-full px-2 py-2 text-[0.8125rem] font-semibold transition-colors ${
      active === id ? 'bg-gold text-navy' : 'text-paper/85 hover:bg-navy-raised hover:text-gold-soft'
    }`

  return (
    // En-tête bleu nuit translucide, liseré or discret : la signature de la charte « Concierge ».
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/30 bg-navy/90 backdrop-blur supports-[backdrop-filter]:bg-navy/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-5 sm:px-8 xl:gap-1">
        <a href="#accueil" aria-label={dict.header.homeAria} onClick={() => setOpen(false)} className="inline-flex min-h-11 shrink-0 items-center">
          <Logo />
        </a>

        <nav aria-label={dict.header.navLabel} className="hidden items-center gap-0.5 2xl:flex">
          {NAV_IDS.map((id) => (
            <a key={id} href={navHref(id)} aria-current={active === id ? 'location' : undefined} className={linkClass(id)}>
              {navLabel(id)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Bascule de langue : FR | AR | EN. Le choix est persisté (cookie + localStorage). */}
          <LanguageSwitcher dict={dict} className="shrink-0" />
          <a
            href={whatsappUrl(waMessage(dict, 'general'))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={dict.common.whatsappAria}
            lang={dict.meta.languageCode}
            className="btn btn-wa btn-sm max-sm:w-11 max-sm:px-0"
          >
            <WhatsAppIcon className="h-[1.15rem] w-[1.15rem]" />
            <span className="hidden sm:inline">{dict.common.whatsapp}</span>
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold-soft hover:border-gold hover:bg-gold/10 2xl:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? dict.header.closeMenu : dict.header.openMenu}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-mobile" aria-label={dict.header.mobileNavLabel} className="border-t border-gold/20 bg-navy 2xl:hidden">
          <ul className="container-page flex flex-col gap-1 py-3">
            {NAV_IDS.map((id) => (
              <li key={id}>
                <a
                  href={navHref(id)}
                  onClick={() => setOpen(false)}
                  aria-current={active === id ? 'location' : undefined}
                  className={`flex min-h-12 items-center rounded-xl px-4 text-base font-semibold ${
                    active === id ? 'bg-gold text-navy' : 'text-paper hover:bg-navy-raised hover:text-gold-soft'
                  }`}
                >
                  {navLabel(id)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}