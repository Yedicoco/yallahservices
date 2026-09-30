'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { B2B_NEEDS, B2C_SERVICES, CITIES } from '@/lib/content'
import { LEGAL } from '@/lib/site'
import { whatsappUrl } from '@/lib/whatsapp'
import { TikTokIcon, WhatsAppIcon } from './icons'

type Segment = 'particulier' | 'entreprise'
type Visitor = { display_name: string; avatar_url?: string }
type Notice = { tone: 'ok' | 'info'; text: string }

const NOTICES: Record<string, Notice> = {
  connected: { tone: 'ok', text: 'Connexion TikTok réussie : votre nom de profil sera mentionné dans votre message.' },
  denied: { tone: 'info', text: 'Connexion TikTok annulée. Vous pouvez continuer sans TikTok.' },
  error: { tone: 'info', text: 'La connexion TikTok n’a pas abouti. Vous pouvez réessayer, ou continuer sans TikTok.' },
  unavailable: { tone: 'info', text: 'La connexion TikTok n’est pas disponible pour le moment. Vous pouvez continuer sans TikTok.' },
}

const FIELD = 'mt-1.5 block w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-stone/70'

function buildMessage(input: { segment: Segment; need: string; city: string; district: string; details: string; name?: string }): string {
  const lines = ['Bonjour Yallah Services,']
  if (input.name) lines.push(`Je m’appelle ${input.name} (profil TikTok).`)
  const who = input.segment === 'particulier' ? 'Je suis un particulier' : 'Je représente une entreprise'
  lines.push(`${who} et je recherche : ${input.need || '…'}.`)
  const where = [input.city, input.district.trim()].filter(Boolean).join(', ')
  lines.push(`Ville / quartier : ${where || '…'}.`)
  if (input.details.trim()) lines.push(input.details.trim())
  lines.push('Merci de me recontacter.')
  return lines.join('\n')
}

/**
 * Formulaire de besoin : la demande est composée dans le navigateur puis ouverte dans WhatsApp
 * (canal prioritaire). Rien n'est envoyé ni enregistré sur nos serveurs.
 *
 * Connexion TikTok (Login Kit, facultative) : lit uniquement le nom de profil public, pour
 * personnaliser le message. Aucun accès au compte n'est conservé.
 */
export function LeadForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [segment, setSegment] = useState<Segment>('particulier')
  const [need, setNeed] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [details, setDetails] = useState('')
  const [visitor, setVisitor] = useState<Visitor | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [avatarFailed, setAvatarFailed] = useState(false)

  useEffect(() => {
    // Résultat du retour TikTok (?tiktok=…) : on l'annonce puis on nettoie l'adresse.
    const url = new URL(window.location.href)
    const flag = url.searchParams.get('tiktok')
    if (flag) {
      setNotice(NOTICES[flag] ?? null)
      url.searchParams.delete('tiktok')
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
    }
    fetch('/api/tiktok/auth/status', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { connected?: boolean; profile?: Visitor } | null) => {
        if (data?.connected && data.profile) setVisitor(data.profile)
      })
      .catch(() => undefined)
  }, [])

  const needs = useMemo<readonly string[]>(() => (segment === 'particulier' ? B2C_SERVICES.map((service) => service.title) : B2B_NEEDS), [segment])
  const message = buildMessage({ segment, need, city, district, details, name: visitor?.display_name })

  async function logout() {
    await fetch('/api/tiktok/auth/logout', { method: 'POST' }).catch(() => undefined)
    setVisitor(null)
    setNotice(null)
  }

  return (
    <div className="rounded-[2rem] border border-line bg-white p-6 shadow-sm sm:p-8">
      <h3 className="font-serif text-2xl leading-tight">Décrivez votre besoin</h3>
      <p className="mt-2 text-sm leading-6 text-stone">
        Quelques précisions nous permettent de mieux vous répondre. Votre message s’ouvre ensuite dans WhatsApp, vous pouvez le modifier avant de
        l’envoyer.
      </p>

      {/* Connexion TikTok : facultative */}
      <div className="mt-5 rounded-2xl bg-mist p-4">
        {visitor ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {visitor.avatar_url && !avatarFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={visitor.avatar_url} alt="" width={40} height={40} referrerPolicy="no-referrer" onError={() => setAvatarFailed(true)} className="h-10 w-10 rounded-full bg-paper object-cover" />
              ) : (
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-paper">
                  <TikTokIcon className="h-4 w-4" />
                </span>
              )}
              <p className="text-sm leading-5">
                Connecté(e) avec TikTok
                <br />
                <strong className="text-base">{visitor.display_name}</strong>
              </p>
            </div>
            <button type="button" onClick={logout} className="btn btn-outline btn-sm">
              Se déconnecter
            </button>
          </div>
        ) : (
          <div>
            <a href="/api/tiktok/auth" className="btn btn-ink w-full">
              <TikTokIcon className="h-[1.05rem] w-[1.05rem]" />
              <span>
                Continuer avec TikTok <span className="font-normal opacity-80">(facultatif)</span>
              </span>
            </a>
            <p className="mt-3 text-xs leading-5 text-stone">
              Nous lisons uniquement votre nom de profil public, pour personnaliser votre message. Aucun accès à votre compte n’est conservé.{' '}
              <a href={LEGAL.privacy.href} className="font-semibold underline underline-offset-2">
                En savoir plus
              </a>
              .
            </p>
          </div>
        )}
        {notice && (
          <p role="status" className={`mt-3 text-sm font-semibold ${notice.tone === 'ok' ? 'text-wa' : 'text-ink'}`}>
            {notice.text}
          </p>
        )}
      </div>

      <form ref={formRef} onSubmit={(event) => event.preventDefault()} className="mt-5 space-y-4" noValidate={false}>
        <fieldset>
          <legend className="text-sm font-semibold">Vous êtes</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-2 rounded-full bg-mist p-1">
            {(
              [
                ['particulier', 'Un particulier'],
                ['entreprise', 'Une entreprise'],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="relative">
                <input
                  type="radio"
                  name="segment"
                  value={value}
                  checked={segment === value}
                  onChange={() => {
                    setSegment(value)
                    setNeed('')
                  }}
                  className="peer sr-only"
                />
                <span className="flex min-h-11 cursor-pointer items-center justify-center rounded-full px-3 text-sm font-semibold text-stone transition peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="besoin" className="text-sm font-semibold">
            {segment === 'particulier' ? 'Service recherché' : 'Besoin'}
          </label>
          <select id="besoin" required value={need} onChange={(event) => setNeed(event.target.value)} className={FIELD}>
            <option value="" disabled>
              Choisissez…
            </option>
            {needs.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ville" className="text-sm font-semibold">
              Ville
            </label>
            <select id="ville" required value={city} onChange={(event) => setCity(event.target.value)} className={FIELD}>
              <option value="" disabled>
                Choisissez…
              </option>
              {CITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              <option value="Autre ville">Autre ville</option>
            </select>
          </div>
          <div>
            <label htmlFor="quartier" className="text-sm font-semibold">
              Quartier <span className="font-normal text-stone">(facultatif)</span>
            </label>
            <input
              id="quartier"
              type="text"
              value={district}
              maxLength={60}
              onChange={(event) => setDistrict(event.target.value)}
              placeholder="Ex. Aïn Diab"
              autoComplete="off"
              className={FIELD}
            />
          </div>
        </div>

        <div>
          <label htmlFor="precisions" className="text-sm font-semibold">
            Précisions <span className="font-normal text-stone">(facultatif)</span>
          </label>
          <textarea
            id="precisions"
            rows={3}
            maxLength={500}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Horaires, fréquence, situation particulière…"
            className={FIELD}
          />
        </div>

        <div>
          <p className="text-sm font-semibold">Aperçu de votre message</p>
          <pre className="mt-1.5 whitespace-pre-wrap rounded-xl bg-mist p-4 font-sans text-sm leading-6 text-ink/90">{message}</pre>
        </div>

        <a
          href={whatsappUrl(message)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => {
            // Champs obligatoires manquants : on affiche l'aide native du navigateur au lieu d'ouvrir WhatsApp.
            if (!formRef.current?.checkValidity()) {
              event.preventDefault()
              formRef.current?.reportValidity()
            }
          }}
          className="btn btn-wa w-full"
        >
          <WhatsAppIcon className="h-[1.15rem] w-[1.15rem]" />
          Envoyer ma demande sur WhatsApp
        </a>
        <p className="text-center text-xs leading-5 text-stone">Tarifs et disponibilités confirmés directement lors de l’échange.</p>
      </form>
    </div>
  )
}
