import { Mail, MapPin, MessageCircle } from 'lucide-react'
import { CITIES } from '@/lib/content'
import { SITE } from '@/lib/site'
import { WA } from '@/lib/whatsapp'
import { FacebookIcon, InstagramIcon, LinkedInIcon, TikTokIcon } from './icons'
import { LeadForm } from './LeadForm'
import { WhatsAppLink } from './WhatsAppLink'

const SOCIALS = [
  { ...SITE.socials.tiktok, Icon: TikTokIcon },
  { ...SITE.socials.instagram, Icon: InstagramIcon },
  { ...SITE.socials.facebook, Icon: FacebookIcon },
  { ...SITE.socials.linkedin, Icon: LinkedInIcon },
] as const

export function Contact() {
  return (
    <section id="contact" aria-labelledby="titre-contact" className="py-16 sm:py-24">
      <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div>
          <p className="eyebrow">Contact</p>
          <h2 id="titre-contact" className="section-title mt-3">
            Parlons de votre besoin.
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone">
            Le plus simple : écrivez-nous sur WhatsApp. Nous vous répondons, nous posons les bonnes questions, puis nous vous présentons le
            bon profil.
          </p>

          <WhatsAppLink message={WA.general} className="mt-7 w-full sm:w-auto">
            Écrire sur WhatsApp · {SITE.phoneDisplay}
          </WhatsAppLink>

          <ul className="mt-9 space-y-5">
            <li className="flex items-start gap-4">
              <MessageCircle size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-coral-strong" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-stone">WhatsApp, canal prioritaire</p>
                <a href={`tel:+${SITE.phoneDigits}`} className="text-lg font-semibold hover:underline">
                  {SITE.phoneDisplay}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Mail size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-coral-strong" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-stone">E-mail</p>
                <a href={`mailto:${SITE.email}`} className="text-lg font-semibold hover:underline">
                  {SITE.email}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <MapPin size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-coral-strong" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-stone">Basés à {SITE.baseCity}</p>
                <p className="text-lg font-semibold">Au service de {CITIES.length} villes du Maroc</p>
              </div>
            </li>
          </ul>

          <h3 className="mt-10 text-sm font-bold uppercase tracking-[0.14em] text-stone">Suivez-nous</h3>
          <ul className="mt-3 flex flex-wrap gap-2.5">
            {SOCIALS.map(({ label, handle, url, Icon }) => (
              <li key={label}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line bg-white px-4 text-sm font-semibold hover:border-ink"
                >
                  <Icon className="h-4 w-4" />
                  <span>
                    {label}
                    <span className="sr-only"> : {handle}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <LeadForm />
      </div>
    </section>
  )
}
