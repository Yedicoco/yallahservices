import { cookies, headers } from 'next/headers'
import { Logo } from '@/components/site/Logo'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { LOCALE_COOKIE } from '@/lib/i18n/config'
import { resolveLocale } from '@/lib/i18n/server'

/**
 * Page 404 de la marque. Elle sert aussi de réponse à /connect pour tout visiteur non autorisé :
 * l'espace interne est indiscernable d'une page qui n'existe pas.
 *
 * Langue : cookie de préférence, puis `Accept-Language` (pas de `?lang=` ici, une 404 n'a pas
 * de paramètres). L'URL canonique reste la page d'accueil, dans la langue du visiteur.
 */
export default async function NotFound() {
  const cookie = (await cookies().catch(() => null))?.get(LOCALE_COOKIE)?.value ?? null
  const acceptLanguage = (await headers().catch(() => null))?.get('accept-language') ?? null
  const locale = resolveLocale({ cookie, acceptLanguage })
  const dict = getDictionary(locale)

  // Aucun composant de cette page ne lit le contexte : le dictionnaire est lu directement.
  return (
    <main className="grid min-h-screen place-items-center px-6 py-16 text-center">
      <div className="max-w-md">
        <a href="/" aria-label={dict.notFound.homeAria} className="inline-block">
          <Logo />
        </a>
        <p className="eyebrow mt-10">{dict.notFound.eyebrow}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.02em] rtl:tracking-normal">{dict.notFound.title}</h1>
        <p className="mt-4 text-base leading-7 text-stone">{dict.notFound.description}</p>
        <a href="/" className="btn btn-ink mt-8">
          {dict.notFound.cta}
        </a>
      </div>
    </main>
  )
}
