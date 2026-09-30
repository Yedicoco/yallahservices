'use client'

/**
 * Lecteur vidéo vertical (9:16), léger pour le mobile : rien n'est téléchargé avant l'appui sur
 * lecture (preload="none" + image de couverture). Une seule vidéo joue à la fois.
 */
export function VideoPlayer({ src, poster, title }: { src: string; poster: string; title: string }) {
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
      Votre navigateur ne peut pas lire cette vidéo. <a href={src}>Télécharger la vidéo</a>.
    </video>
  )
}
