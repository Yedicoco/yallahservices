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
  {
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ae28a7b0-a551-11f1-a943-d9befee7b578-fICNJsGf7PaHjnpulrqiCLHhzqgLqd.webp',
    name: 'Yallah Services',
    handle: '@yallah.services.maroc',
    caption: 'Plus de temps pour vous : nous prenons soin de votre maison.',
    song: 'WhatsApp · +212 691 733 585',
    likes: '1.2K',
    comments: '86',
    accent: 'from-[#071a35]/90',
    tag: 'Ménage · Repassage · Nettoyage',
  },
  {
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/b6821b30-a551-11f1-a943-d9befee7b578.png-a1AaTSc2l9CP0nCSCvOVPrwV8zxEeb.jpeg',
    name: 'Yallah Services',
    handle: '@yallah.services.maroc',
    caption: 'Besoin d’une femme de ménage ? Des profils sérieux, disponibles et sélectionnés avec soin.',
    song: 'Casablanca · Profils vérifiés',
    likes: '948',
    comments: '54',
    accent: 'from-[#06172f]/90',
    tag: 'Profils sélectionnés',
  },
  {
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/grilles%20des%20salaires%20par%20Aide%20et%20taches-ccrH5xho5pg9TT1OlE6jnnkmGJTtdQ.jpeg',
    name: 'Yallah Services',
    handle: '@yallah.services.maroc',
    caption: 'Découvrez nos tarifs indicatifs pour ménage, nounou, cuisine et garde-malade.',
    song: 'Grille tarifaire · À partir de 3 500 DH',
    likes: '2.4K',
    comments: '137',
    accent: 'from-[#090d16]/90',
    tag: 'Tarifs Maroc',
  },
]

export default function Page() {
  const [activeTab, setActiveTab] = useState('For you')
  const [liked, setLiked] = useState<Record<number, boolean>>({})
  const [saved, setSaved] = useState<Record<number, boolean>>({})
  const [muted, setMuted] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeVideo, setActiveVideo] = useState(0)

  return (
    <main className="min-h-screen bg-[#f6f1e8] text-[#171717] selection:bg-[#fa5b48] selection:text-white">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-[232px] flex-col border-r border-[#ded8cd] bg-[#f6f1e8] px-7 py-7 lg:flex">
          <div className="mb-14 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fa5b48] text-xl font-black text-white">y</div>
            <span className="text-[23px] font-black tracking-[-0.08em]">yallah<span className="text-[#fa5b48]">.</span></span>
          </div>
          <nav className="space-y-2" aria-label="Main navigation">
            <NavItem icon={<Home size={19} />} label="Home" active />
            <NavItem icon={<Compass size={19} />} label="Discover" />
            <NavItem icon={<Bell size={19} />} label="Inbox" badge="3" />
            <NavItem icon={<UserRound size={19} />} label="Profile" />
          </nav>
          <div className="mt-auto border-t border-[#ded8cd] pt-6">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8f897f]">Your space</p>
            <NavItem icon={<Bookmark size={18} />} label="Saved" />
            <NavItem icon={<Sparkles size={18} />} label="Following" />
            <button className="mt-7 flex w-full items-center gap-3 rounded-xl bg-[#171717] px-4 py-3 text-sm font-semibold text-[#f6f1e8] transition-transform hover:-translate-y-0.5">
              <Plus size={18} /> Create
            </button>
          </div>
          <p className="mt-7 text-[10px] leading-4 text-[#8f897f]">© 2024 yallah<br />made for the curious</p>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-[78px] items-center justify-between border-b border-[#ded8cd] px-5 sm:px-10">
            <div className="flex items-center gap-5 lg:hidden"><span className="text-xl font-black tracking-[-0.08em]">yallah<span className="text-[#fa5b48]">.</span></span></div>
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
              <button className="hidden rounded-full border border-[#cfc8bc] px-4 py-2 text-xs font-bold sm:block">Log in</button>
              <button className="rounded-full bg-[#fa5b48] px-4 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5">Sign up</button>
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
            <div className="space-y-8">
              {videos.map((video, index) => (
                <article key={video.handle} className="group grid gap-5 sm:grid-cols-[minmax(230px,320px)_1fr] sm:gap-7">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-[#ddd3c7] shadow-[0_14px_30px_rgba(39,31,22,0.12)] sm:aspect-[3/4]">
                    <img src={video.image} alt={`${video.name} video`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                    <div className={`absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t ${video.accent} to-transparent`} />
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white">
                      <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-[#171717]/20 text-xs font-bold">{video.name.split(' ').map((n) => n[0]).join('')}</div><span className="text-sm font-bold">{video.handle}</span></div>
                      <button aria-label={muted ? 'Unmute video' : 'Mute video'} onClick={() => setMuted(!muted)} className="rounded-full bg-black/20 p-2 backdrop-blur-sm">{muted ? <VolumeX size={15} /> : <Volume2 size={15} />}</button>
                    </div>
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#171717]">{video.tag}</div>
                  </div>
                  <div className="flex min-h-full flex-col justify-center py-1 sm:py-5">
                    <div className="mb-5 flex items-center gap-2 text-xs text-[#8f897f]"><span className="h-1.5 w-1.5 rounded-full bg-[#fa5b48]" />{index === activeVideo ? 'Now playing' : 'Featured for you'}</div>
                    <h2 className="max-w-[390px] font-serif text-3xl leading-[1.05] tracking-[-0.04em] sm:text-4xl">{video.caption}</h2>
                    <div className="mt-7 flex items-center gap-3 text-sm font-semibold"><Music2 size={16} className="text-[#fa5b48]" /><span>{video.song}</span></div>
                    <div className="mt-8 flex items-center gap-5 border-b border-[#ded8cd] pb-6">
                      <button onClick={() => setLiked({ ...liked, [index]: !liked[index] })} className={`flex items-center gap-2 text-xs font-bold transition-colors ${liked[index] ? 'text-[#fa5b48]' : 'text-[#6f6a63]'}`}><Heart size={19} fill={liked[index] ? 'currentColor' : 'none'} />{liked[index] ? '48.3K' : video.likes}</button>
                      <button className="flex items-center gap-2 text-xs font-bold text-[#6f6a63]"><MessageCircle size={18} />{video.comments}</button>
                      <button onClick={() => setSaved({ ...saved, [index]: !saved[index] })} aria-label="Save video" className={`ml-auto rounded-full p-2 ${saved[index] ? 'bg-[#171717] text-white' : 'text-[#6f6a63] hover:bg-[#e9e2d8]'}`}><Bookmark size={18} fill={saved[index] ? 'currentColor' : 'none'} /></button>
                      <button aria-label="Share video" className="rounded-full p-2 text-[#6f6a63] hover:bg-[#e9e2d8]"><Share2 size={18} /></button>
                    </div>
                    <button onClick={() => setActiveVideo(index)} className="mt-5 flex items-center gap-2 self-start text-xs font-bold text-[#fa5b48]">Présenter mon besoin <ChevronDown className="-rotate-90" size={15} /></button>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-16 flex items-center justify-between rounded-2xl bg-[#e9e2d8] p-5 sm:p-7"><div><p className="font-serif text-2xl">Vous avez un besoin ?</p><p className="mt-1 text-xs text-[#777066]">Écrivez-nous sur WhatsApp au +212 691733585.</p></div><a href="https://wa.me/212691733585" target="_blank" rel="noreferrer" className="rounded-full bg-[#fa5b48] px-5 py-3 text-xs font-bold text-white">Nous contacter</a></div>
          </div>
        </section>
      </div>
      <button className="fixed bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#fa5b48] text-white shadow-lg lg:hidden" aria-label="Create"><Plus size={22} /></button>
    </main>
  )
}

function NavItem({ icon, label, active = false, badge }: { icon: React.ReactNode; label: string; active?: boolean; badge?: string }) {
  return <button className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${active ? 'bg-[#171717] text-white' : 'text-[#6f6a63] hover:bg-[#e9e2d8]'}`}>{icon}<span>{label}</span>{badge && <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#fa5b48] px-1 text-[10px] text-white">{badge}</span>}</button>
}

function CloseButton({ onClick }: { onClick: () => void }) { return <button onClick={onClick} aria-label="Close"><X size={18} /></button> }
    
