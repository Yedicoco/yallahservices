import { CITIES } from '@/lib/content'
import { SITE, siteUrl } from '@/lib/site'
import { Contact } from '@/components/site/Contact'
import { Entreprises } from '@/components/site/Entreprises'
import { Hero } from '@/components/site/Hero'
import { Particuliers } from '@/components/site/Particuliers'
import { PricingTable } from '@/components/site/PricingTable'
import { Process } from '@/components/site/Process'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Videos } from '@/components/site/Videos'
import { Zones } from '@/components/site/Zones'

/**
 * Vitrine commerciale Yallah Services (particuliers + entreprises).
 * Données structurées schema.org : agence de placement de personnel, zones desservies, réseaux.
 * Aucun prix n'y figure volontairement (les tarifs restent « à titre indicatif » dans le tableau).
 */
function structuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EmploymentAgency',
    name: SITE.name,
    slogan: SITE.tagline,
    description: SITE.description,
    url: siteUrl(),
    logo: SITE.logoUrl,
    image: `${siteUrl()}/opengraph-image`,
    telephone: `+${SITE.phoneDigits}`,
    email: SITE.email,
    address: { '@type': 'PostalAddress', addressLocality: SITE.baseCity, addressCountry: SITE.country },
    areaServed: CITIES.map((name) => ({ '@type': 'City', name })),
    sameAs: Object.values(SITE.socials).map((social) => social.url),
  }
}

export default function HomePage() {
  return (
    <>
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>
      <SiteHeader />
      <main id="contenu">
        <Hero />
        <Particuliers />
        <Entreprises />
        <Process />
        <PricingTable />
        <Zones />
        <Videos />
        <Contact />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        // Le JSON est généré côté serveur à partir de constantes ; « < » est échappé par précaution.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()).replace(/</g, '\\u003c') }}
      />
    </>
  )
}
