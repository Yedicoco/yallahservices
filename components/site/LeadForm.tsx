'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, FileCheck2, RotateCcw, ShieldAlert } from 'lucide-react'
import { B2B_NEED_IDS, B2C_SERVICE_IDS, CITY_IDS } from '@/lib/content'
import { t } from '@/lib/i18n/dictionaries'
import { LtrValue } from '@/lib/i18n/react'
import { LEGAL } from '@/lib/site'
import { whatsappUrl } from '@/lib/whatsapp'
import { TikTokIcon, WhatsAppIcon } from './icons'
import type { Dictionary } from '@/lib/i18n/dictionaries'

type Segment = 'particulier' | 'entreprise'
type AccommodationChoice = 'logee' | 'nonLogee' | 'aDefinir'
type Visitor = { display_name: string; avatar_url?: string }
type Notice = { tone: 'ok' | 'info'; text: string }

const FIELD =
  'mt-1.5 block w-full rounded-xl border border-gold/25 bg-navy-deep px-4 py-3 text-base text-ink placeholder:text-stone/70 focus-visible:border-gold'

/** Génère un numéro de dossier unique au format YAL-XXXXXX (6 chiffres). */
function generateDossierId(): string {
  const randomSix = Math.floor(100000 + Math.random() * 900000)
  return `YAL-${randomSix}`
}

/**
 * Message WhatsApp composé à partir des modèles traduits (`dict.form.message`).
 */
function composeMessage(
  lines: readonly string[],
  values: { prenom: string; qui: string; besoin: string; ville: string },
  extra: { dossier?: string; modalite?: string; details?: string },
): string {
  const [greeting, nameLine, needLine, cityLine, closing] = lines
  const out: string[] = []
  if (extra.dossier) {
    out.push(`[${extra.dossier}] ${greeting}`)
  } else {
    out.push(greeting)
  }
  if (values.prenom) out.push(t(nameLine, values))
  const needWithMode = extra.modalite ? `${values.besoin} (${extra.modalite})` : values.besoin
  out.push(t(needLine, { ...values, besoin: needWithMode }))
  out.push(t(cityLine, { ...values, ville: values.ville || '…' }))
  if (extra.details?.trim()) out.push(extra.details.trim())
  if (closing) out.push(closing)
  return out.filter(Boolean).join('\n')
}

/**
 * Formulaire de besoin avec filtre « Réservé aux foyers / entreprises souhaitant recruter » (Tâche 4)
 * et écran de confirmation complet après soumission (Tâche 6 : numéro YAL-XXXXXX, récapitulatif,
 * prochaines étapes numérotées et lien direct vers la conversation WhatsApp pré-remplie).
 */
export function LeadForm({ dict }: { dict: Dictionary }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [segment, setSegment] = useState<Segment>('particulier')
  const [need, setNeed] = useState('')
  const [accommodation, setAccommodation] = useState<AccommodationChoice>('logee')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [details, setDetails] = useState('')
  const [dossierId, setDossierId] = useState<string | null>(null)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const needs = useMemo<readonly { id: string; label: string }[]>(
    () =>
      segment === 'particulier'
        ? B2C_SERVICE_IDS.map((id) => ({ id, label: dict.b2c.services[id].title }))
        : B2B_NEED_IDS.map((id) => ({ id, label: dict.form.b2bNeeds[id] })),
    [segment, dict],
  )

  const cityOptions = useMemo(() => CITY_IDS.map((id) => ({ id, label: dict.zones.cities[id] })), [dict])

  const accommodationLabel =
    segment === 'particulier' ? dict.form.accommodationOptions[accommodation] : ''

  const locationDisplay = [city, district.trim()].filter(Boolean).join(', ')

  const message = useMemo(
    () =>
      composeMessage(
        dict.form.message,
        {
          prenom: visitor?.display_name ?? '',
          qui: segment === 'particulier' ? dict.form.segments.particulier : dict.form.segments.entreprise,
          besoin: need || '…',
          ville: locationDisplay,
        },
        {
          dossier: dossierId ?? undefined,
          modalite: segment === 'particulier' ? accommodationLabel : undefined,
          details,
        },
      ),
    [dict, visitor, segment, need, locationDisplay, dossierId, accommodationLabel, details],
  )

  async function logout() {
    await fetch('/api/tiktok/auth/logout', { method: 'POST' }).catch(() => undefined)
    setVisitor(null)
    setNotice(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity()
      return
    }
    setDossierId(generateDossierId())
  }

  const conf = dict.form.confirmation

  return (
    <div className="rounded-[2rem] border border-gold/25 bg-navy-soft p-6 sm:p-8">
      {/* Tâche 4 — Filtre « Réservé aux foyers / entreprises souhaitant recruter » au-dessus du formulaire */}
      <div
        role="note"
        className="mb-6 rounded-2xl border border-gold/40 bg-gold/10 p-4 text-start"
      >
        <div className="flex items-start gap-3">
          <ShieldAlert size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-gold" />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-soft">
              {dict.employerFilter.badge}
            </p>
            <p className="mt-1 text-xs font-medium leading-5 text-paper/90 sm:text-sm">
              {dict.employerFilter.formBanner}
            </p>
          </div>
        </div>
      </div>

      {dossierId ? (
        /* ================================================================
           Tâche 6 — ÉCRAN DE CONFIRMATION APRÈS SOUMISSION DU FORMULAIRE
           ================================================================ */
        <div role="status" aria-live="polite" className="space-y-6">
          <div className="rounded-2xl border border-wa/40 bg-navy-deep p-5">
            <div className="flex items-center gap-2.5 text-wa">
              <CheckCircle2 size={22} aria-hidden="true" className="shrink-0" />
              <span className="text-xs font-bold uppercase tracking-[0.16em]">{conf.badge}</span>
            </div>
            <h3 className="mt-2 font-serif text-2xl leading-tight text-ink">{conf.title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-stone">{conf.subtitle}</p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-gold-soft">
                <FileCheck2 size={16} aria-hidden="true" className="text-gold" />
                {conf.dossierLabel}
              </span>
              <strong className="font-mono text-lg font-bold tracking-wider text-gold-bright">
                <LtrValue>{dossierId}</LtrValue>
              </strong>
            </div>
          </div>

          {/* Récapitulatif des informations saisies */}
          <div className="rounded-2xl border border-gold/20 bg-navy-deep p-5">
            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-gold-soft">{conf.summaryTitle}</h4>
            <dl className="mt-3 divide-y divide-gold/15 text-sm">
              <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:justify-between">
                <dt className="text-stone">{conf.summarySegment}</dt>
                <dd className="font-semibold text-paper">
                  {segment === 'particulier' ? dict.form.segments.particulier : dict.form.segments.entreprise}
                  {visitor?.display_name ? ` (${visitor.display_name})` : ''}
                </dd>
              </div>
              <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:justify-between">
                <dt className="text-stone">{conf.summaryNeed}</dt>
                <dd className="font-semibold text-paper">{need}</dd>
              </div>
              {segment === 'particulier' && (
                <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:justify-between">
                  <dt className="text-stone">{conf.summaryAccommodation}</dt>
                  <dd className="font-semibold text-gold-soft">{accommodationLabel}</dd>
                </div>
              )}
              <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:justify-between">
                <dt className="text-stone">{conf.summaryLocation}</dt>
                <dd className="font-semibold text-paper">{locationDisplay}</dd>
              </div>
              {details.trim() && (
                <div className="flex flex-col gap-1 py-2.5">
                  <dt className="text-stone">{conf.summaryDetails}</dt>
                  <dd className="mt-1 whitespace-pre-wrap rounded-xl bg-navy-raised p-3 text-xs leading-5 text-paper/90">
                    {details.trim()}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Prochaines étapes numérotées */}
          <div className="rounded-2xl border border-gold/20 bg-navy-deep p-5">
            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-gold-soft">{conf.stepsTitle}</h4>
            <ol className="mt-3.5 space-y-3">
              {conf.steps.map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-sm leading-6 text-paper/90">
                  <span
                    aria-hidden="true"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy"
                  >
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Lien direct vers la conversation WhatsApp pré-remplie */}
          <div className="space-y-3">
            <a
              href={whatsappUrl(message)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-wa w-full"
            >
              <WhatsAppIcon className="h-[1.15rem] w-[1.15rem]" />
              <span>{t(conf.whatsappCta, { dossier: dossierId })}</span>
            </a>

            <button
              type="button"
              onClick={() => setDossierId(null)}
              className="btn btn-outline w-full"
            >
              <RotateCcw size={16} aria-hidden="true" />
              <span>{conf.editButton}</span>
            </button>
          </div>
        </div>
      ) : (
        /* ================================================================
           FORMULAIRE DE DEMANDE
           ================================================================ */
        <>
          <h3 className="font-serif text-2xl leading-tight text-ink">{dict.form.title}</h3>
          <p className="mt-2 text-sm leading-6 text-stone">{dict.form.intro}</p>

          {/* Connexion TikTok : facultative */}
          <div className="mt-5 rounded-2xl bg-navy-raised p-4">
            {visitor ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {visitor.avatar_url && !avatarFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={visitor.avatar_url}
                      alt=""
                      width={40}
                      height={40}
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarFailed(true)}
                      className="h-10 w-10 rounded-full bg-navy object-cover"
                    />
                  ) : (
                    <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-deep text-paper">
                      <TikTokIcon className="h-4 w-4" />
                    </span>
                  )}
                  <p className="text-sm leading-5">
                    {dict.form.tiktokConnected}
                    <br />
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

          <form ref={formRef} onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate={false}>
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

            {segment === 'particulier' && (
              <div>
                <label htmlFor="modalite" className="text-sm font-semibold">
                  {dict.form.accommodationLabel}
                </label>
                <select
                  id="modalite"
                  value={accommodation}
                  onChange={(event) => setAccommodation(event.target.value as AccommodationChoice)}
                  className={FIELD}
                >
                  <option value="logee">{dict.form.accommodationOptions.logee}</option>
                  <option value="nonLogee">{dict.form.accommodationOptions.nonLogee}</option>
                  <option value="aDefinir">{dict.form.accommodationOptions.aDefinir}</option>
                </select>
              </div>
            )}

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
              <pre dir="auto" className="mt-1.5 whitespace-pre-wrap rounded-xl bg-navy-raised p-4 font-sans text-sm leading-6 text-paper/90">
                {message}
              </pre>
            </div>

            <button type="submit" className="btn btn-wa w-full">
              <WhatsAppIcon className="h-[1.15rem] w-[1.15rem]" />
              {dict.form.submit}
            </button>
            <p className="text-center text-xs leading-5 text-stone">{dict.form.footnote}</p>
          </form>
        </>
      )}
    </div>
  )
}
