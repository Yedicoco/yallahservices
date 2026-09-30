import { Mail, MapPin, MessageCircle, Send } from 'lucide-react'
import { CITIES } from '@/lib/content'
import { SITE } from '@/lib/site'
import { WA } from '@/lib/whatsapp'
import { FacebookIcon, InstagramIcon, LinkedInIcon, TikTokIcon, WhatsAppIcon } from './icons'
import { LeadForm } from './LeadForm'
import { WhatsAppLink } from './WhatsAppLink'

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

export function Contact() {
  return (
    <section id="contact" aria-labelledby="titre-contact" className="bg-sand py-16 sm:py-24">
      <div className="container-page grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        <div>
          <p className="eyebrow">Contact</p>
          <h2 id="titre-contact" className="section-title mt-3">
            Parlons de votre besoin.
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone">
            Le plus simple : écrivez-nous sur WhatsApp. Nous vous répondons, nous posons les bonnes questions, puis nous vous présentons le
            bon profil.
          </p>

          {/* Aperçu de conversation : bulles de discussion officielles, fond vert clair. */}
          <div
            aria-hidden="true"
            className="mt-7 overflow-hidden rounded-[1.75rem] border border-line shadow-lg"
            style={{ backgroundColor: '#e9f7ef' }}
          >
            <div className="flex items-center gap-3 bg-wa-deep px-4 py-3 text-white">
              <WhatsAppIcon className="h-6 w-6 shrink-0" />
              <div className="leading-tight">
                <p className="text-sm font-bold">Yallah Services</p>
                <p className="text-xs text-white/80">en ligne</p>
              </div>
            </div>

            <div
              className="space-y-2.5 px-4 py-5"
              style={{
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.75) 1px, transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            >
              <p className="text-center text-[11px] font-semibold text-stone">Aujourd’hui</p>

              <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-[#d9fdd3] px-3.5 py-2.5 shadow-sm">
                <p className="text-[0.9rem] leading-6 text-ink">
                  Bonjour Yallah Services, j’aimerais échanger sur mon besoin. Je cherche une nounou à Casablanca.
                </p>
                <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-stone">
                  09:41 <Ticks className="text-[#53bdeb]" />
                </p>
              </div>

              <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 shadow-sm">
                <p className="text-[0.9rem] leading-6 text-ink">
                  Bonjour 👋 Merci pour votre message. Pouvez-vous préciser vos horaires et la fréquence souhaitée ?
                </p>
                <p className="mt-1 text-[10px] text-stone">09:44</p>
              </div>

              <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 shadow-sm">
                <p className="text-[0.9rem] leading-6 text-ink">
                  Parfait. Nous revenons vers vous sous 24h avec des profils vérifiés, adaptés à votre besoin.
                </p>
                <p className="mt-1 text-[10px] text-stone">09:45</p>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-line bg-white px-4 py-3">
              <span className="flex-1 rounded-full bg-sand px-4 py-2 text-sm text-stone">Message</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-wa text-white">
                <Send size={15} />
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs leading-5 text-stone">
            Aperçu d’un échange type. Votre message s’ouvre ensuite dans WhatsApp : vous pouvez le modifier avant de l’envoyer.
          </p>

          <WhatsAppLink message={WA.general} className="mt-5 w-full sm:w-auto">
            Écrire sur WhatsApp · {SITE.phoneDisplay}
          </WhatsAppLink>

          <ul className="mt-9 space-y-5">
            <li className="flex items-start gap-4">
              <MessageCircle size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-mint-deep" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-stone">WhatsApp, canal prioritaire</p>
                <a href={`tel:+${SITE.phoneDigits}`} className="text-lg font-semibold hover:underline">
                  {SITE.phoneDisplay}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <Mail size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-mint-deep" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-stone">E-mail</p>
                <a href={`mailto:${SITE.email}`} className="text-lg font-semibold hover:underline">
                  {SITE.email}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <MapPin size={22} aria-hidden="true" className="mt-0.5 shrink-0 text-mint-deep" />
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
