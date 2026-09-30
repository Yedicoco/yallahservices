'use client'

/**
 * Lecteur vidéo vertical (9:16), léger pour le mobile : rien n'est téléchargé avant l'appui sur
 * lecture (preload="none" + image de couverture). Une seule vidéo joue à la fois.
 * Les deux textes affichés (refus de lecture, téléchargement) sont passés traduits par l'appelant.
 */
export function VideoPlayer({
  src,
  poster,
  title,
  unsupportedText,
  downloadText,
}: {
  src: string
  poster: string
  title: string
  unsupportedText: string
  downloadText: string
}) {
  return (
    <video
      className="aspect-[9/16] w-full rounded-2xl bg-black object-cover"
      controls
      playsInline
      preload="none"
      poster={poster}
      aria-label={title}
      onPlay={(event) => {
        document.querySelectorAll('video').forEach((other) => {
          if (other !== event.currentTarget) other.pause()
        })
      }}
    >
      <source src={src} type="video/mp4" />
      {unsupportedText} <a href={src}>{downloadText}</a>.
    </video>
  )
}
