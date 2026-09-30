import { t } from '@/lib/i18n/dictionaries'
import { formatDuration, posterSrc, videoSrc, type VideoEntry } from '@/lib/videos'
import { VideoPlayer } from './VideoPlayer'
import { WhatsAppLink } from './WhatsAppLink'
import type { Dictionary } from '@/lib/i18n/dictionaries'

/**
 * Carte vidéo : lecteur, titre, description et TOUJOURS un accès direct à WhatsApp
 * (constante éditoriale). Aucun tarif, aucun nom de client ou de candidat.
 * Titre et description sont traduits (`dict.videos.entries[id]`) ; la légende TikTok, elle,
 * reste française (c'est le texte publié sur le compte, hors site).
 */
export function VideoCard({ video, dict, tone = 'light' }: { video: VideoEntry; dict: Dictionary; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark'
  const copy = dict.videos.entries[video.id] ?? { title: video.title, description: video.description }
  const duration = formatDuration(video.durationSec)

  return (
    <article className={`overflow-hidden rounded-3xl border p-3 ${dark ? 'border-white/15 bg-white/5' : 'border-line bg-white shadow-sm'}`}>
      <VideoPlayer
        src={videoSrc(video)}
        poster={posterSrc(video)}
        title={copy.title}
        unsupportedText={dict.videos.playerUnsupported}
        downloadText={dict.videos.playerDownload}
      />
      <div className="px-2 pb-2 pt-4">
        <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${dark ? 'text-paper/60' : 'text-stone'}`}>
          {/* Une durée reste LTR : « 0:25 » ne s'écrit pas « 52:0 ». */}
          <span dir="ltr">{t(dict.videos.durationLabel, { duree: duration })}</span>
        </p>
        <h3 className="mt-1.5 font-serif text-lg leading-snug">{copy.title}</h3>
        <p className={`mt-2 text-sm leading-6 ${dark ? 'text-paper/70' : 'text-stone'}`}>{copy.description}</p>
        <WhatsAppLink dict={dict} messageKey="video" params={{ video: copy.title }} variant={dark ? 'light' : 'wa'} className="btn-sm mt-4 w-full">
          {dict.videos.cta}
        </WhatsAppLink>
      </div>
    </article>
  )
}
