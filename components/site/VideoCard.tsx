import { formatDuration, posterSrc, videoSrc, type VideoEntry } from '@/lib/videos'
import { WA } from '@/lib/whatsapp'
import { VideoPlayer } from './VideoPlayer'
import { WhatsAppLink } from './WhatsAppLink'

/**
 * Carte vidéo : lecteur, titre, description et TOUJOURS un accès direct à WhatsApp
 * (constante éditoriale). Aucun tarif, aucun nom de client ou de candidat.
 */
export function VideoCard({ video, tone = 'light' }: { video: VideoEntry; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark'
  return (
    <article className={`overflow-hidden rounded-3xl border p-3 ${dark ? 'border-white/15 bg-white/5' : 'border-line bg-white shadow-sm'}`}>
      <VideoPlayer src={videoSrc(video)} poster={posterSrc(video)} title={video.title} />
      <div className="px-2 pb-2 pt-4">
        <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${dark ? 'text-paper/60' : 'text-stone'}`}>
          Durée {formatDuration(video.durationSec)}
        </p>
        <h3 className="mt-1.5 font-serif text-lg leading-snug">{video.title}</h3>
        <p className={`mt-2 text-sm leading-6 ${dark ? 'text-paper/70' : 'text-stone'}`}>{video.description}</p>
        <WhatsAppLink message={WA.video(video.title)} variant={dark ? 'light' : 'wa'} className="btn-sm mt-4 w-full">
          Écrire sur WhatsApp
        </WhatsAppLink>
      </div>
    </article>
  )
}
