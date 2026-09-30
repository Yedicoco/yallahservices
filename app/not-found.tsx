import { Logo } from '@/components/site/Logo'

/**
 * Page 404 de la marque. Elle sert aussi de réponse à /connect pour tout visiteur non autorisé :
 * l'espace interne est indiscernable d'une page qui n'existe pas.
 */
export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-16 text-center">
      <div className="max-w-md">
        <a href="/" aria-label="Yallah Services, retour à l’accueil" className="inline-block">
          <Logo />
        </a>
        <p className="eyebrow mt-10">Erreur 404</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.02em]">Page introuvable</h1>
        <p className="mt-4 text-base leading-7 text-stone">Cette page n’existe pas ou n’est plus disponible. Retrouvez nos services depuis l’accueil.</p>
        <a href="/" className="btn btn-ink mt-8">
          Retour à l’accueil
        </a>
      </div>
    </main>
  )
}
