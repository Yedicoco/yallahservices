'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { B2B_NEED_IDS, B2C_SERVICE_IDS, CITY_IDS } from '@/lib/content'
import { t } from '@/lib/i18n/dictionaries'
import { LEGAL } from '@/lib/site'
import { whatsappUrl } from '@/lib/whatsapp'
import { TikTokIcon, WhatsAppIcon } from './icons'
import type { Dictionary } from '@/lib/i18n/dictionaries'

type Segment = 'particulier' | 'entreprise'
type Visitor = { display_name: string; avatar_url?: string }
type Notice = { tone: 'ok' | 'info'; text: string }

const FIELD =
  'mt-1.5 block w-full rounded-xl border border-gold/25 bg-navy-deep px-4 py-3 text-base text-ink placeholder:text-stone/70 focus-visible:border-gold'

/**
 * Message WhatsApp composé à partir des modèles traduits (`dict.form.message`) : la demande ouverte
 * dans WhatsApp est donc écrite dans la langue que le visiteur est en train de lire.
 * Les lignes sont dans l'ordre du dictionnaire ; la ligne nominative saute si TikTok n'est pas connecté.
 */
function composeMessage(
  lines: readonly string[],
  values: { prenom: string; qui: string; besoin: string; ville: string },
): string {
  const [greeting, nameLine, needLine, cityLine, closing] = lines
  const out = [greeting]
  if (values.prenom) out.push(t(nameLine, values))
  out.push(t(needLine, values))
  out.push(t(cityLine, { ...values, ville: values.ville || '…' }))
  if (closing) out.push(closing)
  return out.filter(Boolean).join('\n')
}

/**
 * Formulaire de besoin : la demande est composée dans le navigateur puis ouverte dans WhatsApp
 * (canal prioritaire). Rien n'est envoyé ni enregistré sur nos serveurs.
 *
 * Connexion TikTok (Login Kit, facultative) : lit uniquement le nom de profil public, pour
 * personnaliser le message. Aucun accès au compte n'est conservé.
 *
 * Les libellés sont dans la langue du visiteur, les données (ville, service choisi) sont transmises
 * au WhatsApp de l'équipe telles que le visiteur les lit — un seul texte à traduire, le message lui-même.
 */
export function LeadForm({ dict }: { dict: Dictionary }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [segment, setSegment] = useState<Segment>('particulier')
  const [need, setNeed] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [details, setDetails] = useState('')
  const [visitor, setVisitor] = useState<Visitor | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [avatarFailed, setAvatarFailed] = useState(false)

  const NOTICES: Record<string, Notice> = useMemo(
    () => ({
      connected: { tone: 'ok', text: dict.form.notices.connected },
      denied: { tone: 'info', text: dict.form.notices.denied },
      error: { tone: 'info', text: dict.form.notices.error },
      unavailable: { tone: 'info', text: dict.form.notices.unavailable },
    }),
    [dict],
  )

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
    // Le nettoyage d'URL et la lecture de session ne se font qu'une fois ; les libellés de notification
    // sont lus au moment du `setNotice` (d'où `NOTICES` volontairement absent des dépendances).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Besoins proposés : libellés traduits, valeur = libellé traduit (c'est ce que l'équipe lira dans WhatsApp).
  const needs = useMemo<readonly { id: string; label: string }[]>(
    () =>
      segment === 'particulier'
        ? B2C_SERVICE_IDS.map((id) => ({ id, label: dict.b2c.services[id].title }))
        : B2B_NEED_IDS.map((id) => ({ id, label: dict.form.b2bNeeds[id] })), 
    [segment, dict],
  )

  const cityOptions = useMemo(() => CITY_IDS.map((id) => ({ id, label: dict.zones.cities[id] })), [dict])

  const message = useMemo(
    () =>
      composeMessage(dict.form.message, {
        prenom: visitor?.display_name ?? '',
        qui: segment === 'particulier' ? dict.form.segments.particulier : dict.form.segments.entreprise,
        besoin: need || '…',
        ville: [city, district.trim()].filter(Boolean).join(', '),
      }) + (details.trim() ? `\n${details.trim()}` : ''),
    [dict, visitor, segment, need, city, district, details],
  )

  async function logout() {
    await fetch('/api/tiktok/auth/logout', { method: 'POST' }).catch(() => undefined)
    setVisitor(null)
    setNotice(null)
  }

  return (
    <div className="rounded-[2rem] border border-gold/25 bg-navy-soft p-6 sm:p-8">
      <h3 className="font-serif text-2xl leading-tight text-ink">{dict.form.title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone">{dict.form.intro}</p>

      {/* Connexion TikTok : facultative */}
      <div className="mt-5 rounded-2xl bg-navy-raised p-4">
        {visitor ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {visitor.avatar_url && !avatarFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={visitor.avatar_url} alt="" width={40} height={40} referrerPolicy="no-referrer" onError={() => setAvatarFailed(true)} className="h-10 w-10 rounded-full bg-navy object-cover" />
              ) : (
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-deep text-paper">
                  <TikTokIcon className="h-4 w-4" />
                </span>
              )}
              <p className="text-sm leading-5">
                {dict.form.tiktokConnected}
                <br />
                {/* Un nom de profil TikTok est une donnée tierce, non traduite : on la marque dans son écriture. */}
                <strong className="text-base" lang="en" dir="ltr">
                  {visitor.display_name}
                </strong>
              </p>
            </div>
            <button type="button" onClick={logout} className="btn btn-outline btn-sm">
              {dict.form.logout}
            </button>
          </div>
        ) : (
          <div>
            <a href="/api/tiktok/auth" className="btn btn-outline-gold w-full">
              <TikTokIcon className="h-[1.05rem] w-[1.05rem]" />
              <span>
                {dict.form.tiktokContinue} <span className="font-normal opacity-80">{dict.form.optional}</span>
              </span>
            </a>
            <p className="mt-3 text-xs leading-5 text-stone">
              {dict.form.tiktokConnectedInfo}{' '}
              <a href={LEGAL.privacy.href} className="font-semibold underline underline-offset-2">
                {dict.form.learnMore}
              </a>
              .
            </p>
          </div>
        )}
        {notice && (
          <p role="status" className={`mt-3 text-sm font-semibold ${notice.tone === 'ok' ? 'text-wa' : 'text-gold-soft'}`}>
            {notice.text}
          </p>
        )}
      </div>

      <form ref={formRef} onSubmit={(event) => event.preventDefault()} className="mt-5 space-y-4" noValidate={false}>
        <fieldset>
          <legend className="text-sm font-semibold">{dict.form.segmentLegend}</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-2 rounded-full border border-gold/20 bg-navy-deep p-1">
            {(
              [
                ['particulier', dict.form.segments.particulier],
                ['entreprise', dict.form.segments.entreprise],
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
                <span className="flex min-h-11 cursor-pointer items-center justify-center rounded-full px-3 text-sm font-semibold text-stone transition peer-checked:bg-gold peer-checked:text-navy peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="besoin" className="text-sm font-semibold">
            {segment === 'particulier' ? dict.form.serviceLabel : dict.form.needLabel}
          </label>
          <select id="besoin" required value={need} onChange={(event) => setNeed(event.target.value)} className={FIELD}>
            <option value="" disabled>
              {dict.form.placeholderChoose}
            </option>
            {needs.map((item) => (
              <option key={item.id} value={item.label}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ville" className="text-sm font-semibold">
              {dict.form.cityLabel}
            </label>
            <select id="ville" required value={city} onChange={(event) => setCity(event.target.value)} className={FIELD}>
              <option value="" disabled>
                {dict.form.placeholderChoose}
              </option>
              {cityOptions.map((item) => (
                <option key={item.id} value={item.label}>
                  {item.label}
                </option>
              ))}
              <option value={dict.form.otherCity}>{dict.form.otherCity}</option>
            </select>
          </div>
          <div>
            <label htmlFor="quartier" className="text-sm font-semibold">
              {dict.form.districtLabel} <span className="font-normal text-stone">{dict.form.optional}</span>
            </label>
            <input
              id="quartier"
              type="text"
              value={district}
              maxLength={60}
              onChange={(event) => setDistrict(event.target.value)}
              placeholder={dict.form.districtPlaceholder}
              autoComplete="off"
              className={FIELD}
            />
          </div>
        </div>

        <div>
          <label htmlFor="precisions" className="text-sm font-semibold">
            {dict.form.detailsLabel} <span className="font-normal text-stone">{dict.form.optional}</span>
          </label>
          <textarea
            id="precisions"
            rows={3}
            maxLength={500}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder={dict.form.detailsPlaceholder}
            className={FIELD}
          />
        </div>

        <div>
          <p className="text-sm font-semibold">{dict.form.previewLabel}</p>
          {/* Le message garde le sens de lecture de la langue choisie, même si le visiteur saisit du latin. */}
          <pre dir="auto" className="mt-1.5 whitespace-pre-wrap rounded-xl bg-navy-raised p-4 font-sans text-sm leading-6 text-paper/90">
            {message}
          </pre>
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
          {dict.form.submit}
        </a>
        <p className="text-center text-xs leading-5 text-stone">{dict.form.footnote}</p>
      </form>
    </div>
  )
}
