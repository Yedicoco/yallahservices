import { getDictionary } from '@/lib/i18n/dictionaries'
import { resolveSiteText } from '@/lib/i18n/server'
import type { Locale } from '@/lib/i18n/config'
import { SITE, siteUrl } from '@/lib/site'
import { Contact } from '@/components/site/Contact'
import { Entreprises } from '@/components/site/Entreprises'
import { FloatingWhatsApp } from '@/components/site/FloatingWhatsApp'
import { Hero } from '@/components/site/Hero'
import { KeyFigures } from '@/components/site/KeyFigures'
import { Particuliers } from '@/components/site/Particuliers'
import { PricingTable } from '@/components/site/PricingTable'
import { Process } from '@/components/site/Process'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Testimonials } from '@/components/site/Testimonials'
import { Videos } from '@/components/site/Videos'
import { Zones } from '@/components/site/Zones'

/**
 * Vitrine commerciale Yallah Services (particuliers + entreprises).
 * Données structurées schema.org : agence de placement de personnel, zones desservies, réseaux.
 * Aucun prix n'y figure volontairement (les tarifs restent « à titre indicatif » dans le tableau).
 *
 * Toutes les sections sont des Composants Serveur : elles reçoivent le dictionnaire de la langue
 * résolue à la requête et le rendent dans le HTML. Le navigateur reçoit donc une page déjà traduite
 * (y compris `dir="rtl"` en darija), lisible avant tout JavaScript et indexable telle quelle.
 */
function structuredData(locale: Locale) {
  const dict = getDictionary(locale)
  const cityLabel = (id: keyof typeof dict.zones.cities) => dict.zones.cities[id]
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE.name,
    slogan: dict.structured.slogan,
    description: dict.structured.description,
    url: siteUrl(),
    logo: SITE.logoUrl,
    image: `${siteUrl()}/opengraph-image`,
    telephone: `+${SITE.phoneDigits}`,
    email: SITE.email,
    priceRange: '$$',
    inLanguage: dict.meta.languageCode,
    address: { '@type': 'PostalAddress', addressLocality: cityLabel(SITE.baseCity), addressCountry: SITE.country },
    areaServed: (Object.keys(dict.zones.cities) as (keyof typeof dict.zones.cities)[]).map((id) => ({ '@type': 'City', name: cityLabel(id) })),
    sameAs: Object.values(SITE.socials).map((social) => social.url),
  }
}

export default async function HomePage() {
  // Une seule lecture de la requête pour toute la page (`cache()` dans lib/i18n/server.ts) : la langue
  // du <html> posé par le layout est donc forcément la même que celle du contenu.
  const { dict, locale } = await resolveSiteText()

  return (
    <>
      <a href={`#${dict.skip.targetId}`} className="skip-link">
        {dict.skip.label}
      </a>
      <SiteHeader dict={dict} locale={locale} />
      <main id={dict.skip.targetId} className="pb-20 sm:pb-24">
        <Hero dict={dict} locale={locale} />
        <KeyFigures dict={dict} locale={locale} />
        <Particuliers dict={dict} locale={locale} />
        <Entreprises dict={dict} locale={locale} />
        <Process dict={dict} locale={locale} />
        <PricingTable dict={dict} locale={locale} />
        <Zones dict={dict} locale={locale} />
        <Videos dict={dict} locale={locale} />
        <Testimonials dict={dict} locale={locale} />
        <Contact dict={dict} locale={locale} />
      </main>
      <SiteFooter dict={dict} locale={locale} />
      {/* Bouton flottant WhatsApp : accès permanent au canal prioritaire. */}
      <FloatingWhatsApp dict={dict} locale={locale} />
      <script
        type="application/ld+json"
        // Le JSON est généré côté serveur à partir du dictionnaire ; « < » est échappé par précaution.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData(locale)).replace(/</g, '\\u003c') }}
      />
    </>
  )
}
