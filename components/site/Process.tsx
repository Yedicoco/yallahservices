import { PROCESS_STEPS } from '@/lib/content'

/** Réassurance : le sérieux du processus (sélection, vérification, accompagnement humain). */
export function Process() {
  return (
    <section id="confiance" aria-labelledby="titre-confiance" className="bg-sand/60 py-16 sm:py-24">
      <div className="container-page">
        <header className="max-w-2xl">
          <p className="eyebrow">Notre façon de travailler</p>
          <h2 id="titre-confiance" className="section-title mt-3">
            Un processus sérieux, un accompagnement humain.
          </h2>
          <p className="mt-4 text-lg leading-8 text-stone">
            Confier son foyer ou son activité demande de la confiance. Voici, simplement, comment nous procédons.
          </p>
        </header>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step, index) => (
            <li key={step.title} className="relative rounded-3xl border border-line bg-paper p-6">
              <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-serif text-lg text-paper">
                {index + 1}
              </span>
              <h3 className="mt-5 font-serif text-xl leading-tight">
                <span className="sr-only">Étape {index + 1} : </span>
                {step.title}
              </h3>
              <p className="mt-2 text-[0.95rem] leading-7 text-stone">{step.description}</p>
            </li>
          ))}
        </ol>

        <p className="mt-8 max-w-3xl rounded-2xl border border-line bg-paper p-5 text-[0.95rem] leading-7 text-ink/85">
          <strong>Tarifs et disponibilités sont confirmés directement lors de l’échange</strong>, en fonction de votre ville, de vos horaires
          et du niveau de responsabilité attendu.
        </p>
      </div>
    </section>
  )
}
