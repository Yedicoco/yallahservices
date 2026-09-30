'use client'

import { useState } from 'react'
import {
  Bell,
  Bookmark,
  ChevronDown,
  Compass,
  Ellipsis,
  Home,
  MessageCircle,
  Music2,
  Plus,
  Search,
  Share2,
  Sparkles,
  UserRound,
  Volume2,
  VolumeX,
  X,
  Heart,
} from 'lucide-react'

const videos = [
  { source: '/videos/yallah service.mp4', tag: 'Yallah Services', title: 'Le service à domicile, pensé pour votre quotidien.', description: 'Une équipe locale pour vous aider à gagner du temps, avec des profils sérieux et un accompagnement humain.', meta: 'Présentation · Maroc' },
  { source: '/videos/besoin de\'aide à domicile.mp4', tag: 'Besoin d’aide ?', title: 'Trouvez la personne qui correspond vraiment à votre besoin.', description: 'Ménage, nounou, cuisine ou garde-malade : nous vous orientons vers le bon profil.', meta: 'Ménage · Repassage · Garde' },
  { source: '/videos/prospection b2b.mp4', tag: 'Pour les entreprises', title: 'Développez votre activité avec une prospection plus humaine.', description: 'Yallah Services accompagne aussi les professionnels qui veulent structurer leur développement commercial.', meta: 'Prospection · B2B' },
  { source: '/videos/2026-08-28-151819708.mp4', tag: 'Nos repères', title: 'Des informations claires pour choisir sereinement.', description: 'Découvrez nos conseils, nos services et les repères utiles avant de démarrer.', meta: 'Conseils · Services' },
] as const

export default function Page() {
  const [activeTab, setActiveTab] = useState('For you')
  const [liked, setLiked] = useState<Record<number, boolean>>({})
  const [saved, setSaved] = useState<Record<number, boolean>>({})
  const [muted, setMuted] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openPanel, setOpenPanel] = useState<'inbox' | 'profile' | 'signup' | null>(null)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const openSignup = () => {
    setSubmitted(false)
    setOpenPanel('signup')
  }

  return (
    <main className="min-h-screen bg-[#f6f1e8] text-[#171717] selection:bg-[#fa5b48] selection:text-white">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-[232px] flex-col border-r border-[#ded8cd] bg-[#f6f1e8] px-7 py-7 lg:flex">
          <div className="mb-14 flex items-center gap-3">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/da1235a0-a8a6-11f1-ae21-ff04260a3621.png-vH8DW3TxL0jLqWrKaFWAvBFyZ3rZpZ.jpeg"
              alt="Yallah Services Maroc"
              className="h-11 w-11 rounded-full object-cover"
            />
            <span className="text-[23px] font-black tracking-[-0.08em]">yallah<span className="text-[#fa5b48]">.</span><span className="ml-1 text-[23px] font-black tracking-[-0.08em] text-[#6f6a63]">services</span></span>
          </div>
          <nav className="space-y-2" aria-label="Main navigation">
            <NavItem icon={<Home size={19} />} label="Home" active />
            <NavItem icon={<Compass size={19} />} label="Discover" />
            <NavItem icon={<Bell size={19} />} label="Inbox" badge="3" onClick={() => setOpenPanel('inbox')} />
            <NavItem icon={<UserRound size={19} />} label="Profile" onClick={() => setOpenPanel('profile')} />
          </nav>
          <div className="mt-auto border-t border-[#ded8cd] pt-6">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8f897f]">Your space</p>
            <NavItem icon={<Bookmark size={18} />} label="Saved" />
            <NavItem icon={<Sparkles size={18} />} label="Following" />
            <button className="mt-7 flex w-full items-center gap-3 rounded-xl bg-[#171717] px-4 py-3 text-sm font-semibold text-[#f6f1e8] transition-transform hover:-translate-y-0.5">
              <Plus size={18} /> Create
            </button>
          </div>
          <div className="mt-7 border-t border-[#ded8cd] pt-5">
            <div className="space-y-3">
              <a href="https://www.linkedin.com/in/yallah-services" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold text-[#6f6a63] transition-colors hover:text-[#fa5b48]">
                <SocialMark label="in" className="bg-[#0a66c2]" /> LinkedIn
              </a>
              <a href="https://www.tiktok.com/@yallah.services.m" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold text-[#6f6a63] transition-colors hover:text-[#fa5b48]">
                <SocialMark label="♪" className="bg-[#171717]" /> TikTok
              </a>
              <a href="https://www.instagram.com/yallahservice" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold text-[#6f6a63] transition-colors hover:text-[#fa5b48]">
                <SocialMark label="◎" className="bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5]" /> Instagram
              </a>
              <a href="https://www.facebook.com/yallahservicesmaroc" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold text-[#6f6a63] transition-colors hover:text-[#fa5b48]">
                <SocialMark label="f" className="bg-[#1877f2]" /> Facebook
              </a>
              <a href="https://wa.me/212691733585" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-semibold text-[#6f6a63] transition-colors hover:text-[#fa5b48]">
                <SocialMark label="⌕" className="bg-[#25d366]" /> WhatsApp
              </a>
            </div>
            <p className="mt-5 text-[10px] leading-4 text-[#8f897f]">© 2026 Yallah Services<br /><a href="/privacy.html" className="underline-offset-2 hover:underline">Confidentialité</a> · <a href="/terms.html" className="underline-offset-2 hover:underline">Conditions</a></p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-[78px] items-center justify-between border-b border-[#ded8cd] px-5 sm:px-10">
            <div className="flex items-center gap-2 lg:hidden">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/da1235a0-a8a6-11f1-ae21-ff04260a3621.png-vH8DW3TxL0jLqWrKaFWAvBFyZ3rZpZ.jpeg"
                alt="Yallah Services Maroc"
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="text-xl font-black tracking-[-0.08em]">yallah<span className="text-[#fa5b48]">.</span><span className="ml-1 text-sm font-bold tracking-[-0.04em] text-[#6f6a63]">services</span></span>
            </div>
            <div className="hidden items-center gap-8 sm:flex">
              {['For you', 'Following'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`relative py-7 text-sm font-semibold transition-colors ${activeTab === tab ? 'text-[#171717]' : 'text-[#8f897f]'}`}>
                  {tab}{activeTab === tab && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#fa5b48]" />}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {searchOpen && <input autoFocus placeholder="Search yallah" className="w-36 border-b border-[#171717] bg-transparent py-1 text-sm outline-none sm:w-48" />}
              <button aria-label="Search" onClick={() => setSearchOpen(!searchOpen)} className="rounded-full p-2 transition-colors hover:bg-[#e9e2d8]"><Search size={19} /></button>
              <a
                href="/api/tiktok/connect"
                className="hidden items-center gap-2 rounded-full border border-[#171717] px-4 py-2 text-xs font-bold transition-colors hover:bg-[#171717] hover:text-white sm:flex"
              >
                <Music2 size={14} aria-hidden="true" />
                Se connecter à TikTok
              </a>
              <button onClick={openSignup} className="rounded-full bg-[#fa5b48] px-4 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5">Sign up</button>
            </div>
          </header>

          <div className="flex items-center gap-2 border-b border-[#ded8cd] px-5 py-3 sm:hidden">
            {['For you', 'Following'].map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-full px-4 py-2 text-xs font-bold ${activeTab === tab ? 'bg-[#171717] text-white' : 'text-[#8f897f]'}`}>{tab}</button>)}
          </div>

          <div className="mx-auto max-w-[860px] px-4 py-7 sm:px-10 sm:py-10">
            <div className="mb-7 flex items-end justify-between">
              <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#fa5b48]">Yallah Services · Maroc</p><h1 className="font-serif text-4xl font-medium tracking-[-0.04em] sm:text-5xl">Le bon profil, au bon endroit.</h1></div>
              <button aria-label="More options" className="mb-1 rounded-full p-2 hover:bg-[#e9e2d8]"><Ellipsis size={20} /></button>
            </div>
            <section aria-labelledby="videos-heading">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#fa5b48]">Nos vidéos</p>
                  <h2 id="videos-heading" className="font-serif text-3xl tracking-[-0.04em] sm:text-4xl">Découvrez nos solutions, une vidéo à la fois.</h2>
                </div>
                <span className="hidden rounded-full bg-[#e9e2d8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6f6a63] sm:block">04 sujets</span>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {videos.map((video, index) => (
                  <article key={video.source} className="overflow-hidden rounded-[24px] bg-[#171717] text-[#f6f1e8] shadow-[0_18px_40px_rgba(39,31,22,0.12)]">
                    <div className="relative aspect-video bg-black">
                      <video className="h-full w-full object-cover" src={video.source} controls playsInline muted={muted} preload="metadata" aria-label={video.title} />
                      <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-[#fa5b48] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]">0{index + 1}</span>
                    </div>
                    <div className="flex flex-col gap-5 p-5 sm:p-6">
                      <div>
                        <div className="mb-3 flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b7afa4]"><span>{video.tag}</span><span className="truncate">{video.meta}</span></div>
                        <h3 className="font-serif text-2xl leading-[1.05] tracking-[-0.03em]">{video.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-[#b7afa4]">{video.description}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/15 pt-4">
                        <span className="text-xs font-semibold text-[#b7afa4]">Yallah Services</span>
                        <button onClick={() => setMuted(!muted)} aria-label={muted ? 'Activer le son' : 'Couper le son'} className="rounded-full border border-white/20 p-2.5 hover:bg-white/10">{muted ? <VolumeX size={15} /> : <Volume2 size={15} />}</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="salary-heading" className="mt-16">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#fa5b48]">Repères de rémunération</p>
                  <h2 id="salary-heading" className="font-serif text-3xl tracking-[-0.04em] sm:text-4xl">La grille détaillée de nos services.</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f6a63]">Retrouvez les services et les tarifs indicatifs dans une seule affiche. Les montants peuvent varier selon la ville, les horaires et les responsabilités.</p>
                </div>
                <span className="hidden rounded-full bg-[#e9e2d8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6f6a63] sm:block">À titre indicatif</span>
              </div>
              <figure className="overflow-hidden rounded-[24px] border border-[#ded8cd] bg-white shadow-[0_18px_40px_rgba(39,31,22,0.1)]">
                <img src="/images/grille-salaires-services.jpeg" alt="Grille tarifaire détaillée des services Yallah Services Maroc" className="h-auto w-full" />
                <figcaption className="px-5 py-4 text-xs leading-5 text-[#8f897f] sm:px-6">Une présentation complète pour comparer rapidement les services disponibles. Contactez-nous pour confirmer votre besoin et recevoir un accompagnement personnalisé.</figcaption>
              </figure>
            </section>

            <section aria-labelledby="grand-menage-heading" className="mt-16">
              <div className="mb-6">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#fa5b48]">Nouveau service</p>
                <h2 id="grand-menage-heading" className="font-serif text-3xl tracking-[-0.04em] sm:text-4xl">Le grand ménage, en profondeur.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f6a63]">Pour les appartements, résidences et logements Airbnb à Casablanca, notre équipe remet chaque espace en état avec méthode et discrétion.</p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <figure className="overflow-hidden rounded-[24px] bg-[#171717] shadow-[0_18px_40px_rgba(39,31,22,0.12)]">
                  <img src="/images/grand-menage-service.png" alt="Affiche présentant le service de grand ménage pour résidences et appartements" className="h-auto w-full" />
                  <figcaption className="p-5 text-sm leading-6 text-[#b7afa4]">Un service ponctuel ou régulier pour une propreté impeccable, un intérieur soigné et un logement prêt à accueillir.</figcaption>
                </figure>
                <figure className="overflow-hidden rounded-[24px] bg-[#171717] shadow-[0_18px_40px_rgba(39,31,22,0.12)]">
                  <img src="/images/grand-menage-besoin.png" alt="Affiche présentant les besoins de grand ménage à Casablanca" className="h-auto w-full" />
                  <figcaption className="p-5 text-sm leading-6 text-[#b7afa4]">Nettoyage en profondeur, remise en état Airbnb et entretien régulier : choisissez la fréquence adaptée à votre logement.</figcaption>
                </figure>
              </div>
            </section>

            <div className="mt-16 flex items-center justify-between rounded-2xl bg-[#e9e2d8] p-5 sm:p-7"><div><p className="font-serif text-2xl">Vous avez un besoin ?</p><p className="mt-1 text-xs text-[#777066]">Écrivez-nous sur WhatsApp au +212 691733585.</p></div><a href="https://wa.me/212691733585" target="_blank" rel="noreferrer" className="rounded-full bg-[#fa5b48] px-5 py-3 text-xs font-bold text-white transition-transform hover:-translate-y-0.5">Démarrer maintenant</a></div>
          </div>
        </section>
      </div>
      {openPanel && <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/25 p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={openPanel === 'inbox' ? 'Inbox' : openPanel === 'profile' ? 'Profile' : 'Sign up'} onClick={() => setOpenPanel(null)}><section className="w-full max-w-md rounded-[24px] bg-[#f6f1e8] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="mb-6 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#fa5b48]">Yallah Services</p><h2 className="mt-1 font-serif text-3xl">{openPanel === 'inbox' ? 'Votre inbox' : openPanel === 'profile' ? 'Votre profil' : 'Rejoignez-nous'}</h2></div><button onClick={() => setOpenPanel(null)} aria-label="Fermer" className="rounded-full p-2 hover:bg-[#e9e2d8]"><X size={18} /></button></div>{openPanel === 'inbox' && <div className="rounded-2xl bg-[#e9e2d8] p-4 text-sm leading-6 text-[#6f6a63]">Vous avez 3 nouvelles informations. Notre équipe est disponible pour répondre à vos besoins de services à domicile.</div>}{openPanel === 'profile' && <div className="flex flex-col gap-4"><p className="text-sm leading-6 text-[#6f6a63]">Créez votre espace pour retrouver vos demandes et vos services favoris.</p><button onClick={openSignup} className="rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white">Créer mon espace</button></div>}{openPanel === 'signup' && <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }} className="flex flex-col gap-4"><p className="text-sm leading-6 text-[#6f6a63]">Laissez votre email et nous vous recontacterons rapidement.</p><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="votre@email.com" className="rounded-xl border border-[#ded8cd] bg-white px-4 py-3 text-sm outline-none focus:border-[#fa5b48]" aria-label="Adresse email" />{submitted ? <p className="text-sm font-semibold text-[#fa5b48]">Merci, votre demande a bien été envoyée.</p> : <button type="submit" className="rounded-full bg-[#fa5b48] px-5 py-3 text-sm font-bold text-white">S&apos;inscrire</button>}</form>}</section></div>}
      <button onClick={openSignup} className="fixed bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#fa5b48] text-white shadow-lg transition-transform hover:scale-105 lg:hidden" aria-label="Créer un espace"><Plus size={22} /></button>
    </main>
  )
}

function NavItem({ icon, label, active = false, badge, onClick }: { icon: React.ReactNode; label: string; active?: boolean; badge?: string; onClick?: () => void }) {
  return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${active ? 'bg-[#171717] text-white' : 'text-[#6f6a63] hover:bg-[#e9e2d8]'}`}>{icon}<span>{label}</span>{badge && <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#fa5b48] px-1 text-[10px] text-white">{badge}</span>}</button>
}

function SocialMark({ label, className }: { label: string; className: string }) {
  return <span aria-hidden="true" className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white ${className}`}>{label}</span>
}

function CloseButton({ onClick }: { onClick: () => void }) { return <button onClick={onClick} aria-label="Close"><X size={18} /></button> }
    
