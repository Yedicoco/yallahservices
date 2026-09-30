'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, LogOut, ShieldCheck } from 'lucide-react'
import { CAPTION_MAX_LENGTH, hasWhatsAppCta, validateCaption } from '@/lib/content-rules'
import { CTA_LINE, RUBRIQUES, absoluteVideoUrl, formatDuration, posterSrc, videoSrc, type VideoEntry } from '@/lib/videos'
import { SITE } from '@/lib/site'

type Creator = {
  avatar_url: string
  username: string
  nickname: string
  privacy_level_options: string[]
  comment_disabled: boolean
  duet_disabled: boolean
  stitch_disabled: boolean
  max_video_post_duration_sec: number
}

type Connection =
  | { kind: 'loading' }
  | { kind: 'disconnected'; reconnect?: boolean; message?: string }
  | { kind: 'connected'; creator: Creator; storage: 'upstash' | 'memory'; refreshExpiresAt?: number }
  | { kind: 'error'; message: string }

type PublishResult =
  | { kind: 'error'; message: string }
  | { kind: 'started'; publishId: string; status?: string; failReason?: string }

const RETURN_MESSAGES: Record<string, string> = {
  access_denied: 'Autorisation refusée sur TikTok : le compte n’a pas été connecté.',
  tiktok_error: 'TikTok a renvoyé une erreur pendant l’autorisation. Réessayez.',
  state_mismatch: 'La vérification de sécurité a échoué (session expirée). Relancez la connexion.',
  scope_missing: 'L’autorisation « video.publish » n’a pas été accordée. Relancez la connexion et acceptez toutes les permissions.',
  token_exchange_failed: 'TikTok a refusé l’échange d’autorisation. Vérifiez les identifiants et l’URI de retour déclarés, puis réessayez.',
  config: 'Configuration incomplète (variables TikTok ou stockage). Consultez le README.',
  storage: 'Le stockage des jetons (Upstash Redis) est injoignable ou mal configuré.',
}

const PRIVACY_LABELS: Record<string, string> = {
  PUBLIC_TO_EVERYONE: 'Tout le monde',
  MUTUAL_FOLLOW_FRIENDS: 'Amis (abonnements mutuels)',
  FOLLOWER_OF_CREATOR: 'Mes abonnés',
  SELF_ONLY: 'Moi uniquement',
}

const STATUS_LABELS: Record<string, string> = {
  PROCESSING_DOWNLOAD: 'TikTok télécharge la vidéo…',
  PROCESSING_UPLOAD: 'TikTok traite la vidéo…',
  SEND_TO_USER_INBOX: 'Envoyée dans la boîte de réception TikTok.',
  PUBLISH_COMPLETE: 'Publication terminée.',
  FAILED: 'La publication a échoué.',
}

const CUSTOM = 'custom'
const FIELD = 'mt-1.5 block w-full rounded-xl border border-line bg-white px-4 py-3 text-base'

async function api<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T | null }> {
  try {
    const response = await fetch(path, { cache: 'no-store', ...init })
    const data = (await response.json().catch(() => null)) as T | null
    return { ok: response.ok, status: response.status, data }
  } catch {
    return { ok: false, status: 0, data: null }
  }
}

export function AdminPanel({ videos, origin }: { videos: readonly VideoEntry[]; origin: string }) {
  const [connection, setConnection] = useState<Connection>({ kind: 'loading' })
  const [banner, setBanner] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  // Formulaire
  const [selected, setSelected] = useState<string>(videos[0]?.id ?? CUSTOM)
  const [customUrl, setCustomUrl] = useState('')
  const [caption, setCaption] = useState(() => (videos[0] ? `${videos[0].caption}\n\n${CTA_LINE}` : ''))
  const [privacy, setPrivacy] = useState('')
  const [allowComment, setAllowComment] = useState(false)
  const [allowDuet, setAllowDuet] = useState(false)
  const [allowStitch, setAllowStitch] = useState(false)
  const [commercialOn, setCommercialOn] = useState(false)
  const [commercialKind, setCommercialKind] = useState<'' | 'brand' | 'branded'>('')
  const [isAigc, setIsAigc] = useState(false)
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<PublishResult | null>(null)

  const refresh = useCallback(async () => {
    const { ok, status, data } = await api<{
      connected?: boolean
      reconnect?: boolean
      message?: string
      creator?: Creator
      storage?: 'upstash' | 'memory'
      account?: { refresh_expires_at?: number }
      error?: { message?: string; hint?: string }
    }>('/api/tiktok/admin/creator-info')
    if (status === 404) return setConnection({ kind: 'error', message: 'Session expirée : rouvrez l’espace interne avec votre clé.' })
    if (ok && data?.connected && data.creator) {
      return setConnection({ kind: 'connected', creator: data.creator, storage: data.storage ?? 'upstash', refreshExpiresAt: data.account?.refresh_expires_at })
    }
    if (ok && data?.connected === false) return setConnection({ kind: 'disconnected', reconnect: data.reconnect, message: data.message })
    setConnection({ kind: 'error', message: data?.error?.hint ?? data?.error?.message ?? 'Impossible de joindre le service TikTok.' })
  }, [])

  useEffect(() => {
    const url = new URL(window.location.href)
    const error = url.searchParams.get('error')
    if (error) setBanner({ tone: 'error', text: RETURN_MESSAGES[error] ?? 'Une erreur est survenue pendant la connexion TikTok.' })
    else if (url.searchParams.get('connected')) setBanner({ tone: 'ok', text: 'Compte TikTok connecté. Les jetons sont chiffrés et conservés côté serveur.' })
    if (error || url.searchParams.has('connected')) window.history.replaceState(null, '', url.pathname)
    void refresh()
  }, [refresh])

  const video = videos.find((item) => item.id === selected)
  const videoUrl = selected === CUSTOM ? customUrl.trim() : video ? absoluteVideoUrl(video, origin) : ''
  const captionCheck = useMemo(() => validateCaption(caption), [caption])
  const creator = connection.kind === 'connected' ? connection.creator : null

  const tooLong = Boolean(video && creator && video.durationSec > creator.max_video_post_duration_sec)
  const brandedPrivate = commercialOn && commercialKind === 'branded' && privacy === 'SELF_ONLY'
  const commercialIncomplete = commercialOn && !commercialKind
  const blockers = [
    !videoUrl && 'Choisissez une vidéo ou indiquez son adresse.',
    !captionCheck.ok && captionCheck.errors[0],
    !privacy && 'Choisissez la visibilité de la publication.',
    commercialIncomplete && 'Précisez le type de contenu commercial.',
    brandedPrivate && 'Un contenu de marque ne peut pas être privé : choisissez une autre visibilité.',
    tooLong && 'La vidéo est plus longue que la durée maximale autorisée pour ce compte.',
    !consent && 'Confirmez les engagements éditoriaux.',
  ].filter(Boolean) as string[]

  function chooseVideo(id: string) {
    setSelected(id)
    const next = videos.find((item) => item.id === id)
    setCaption(next ? `${next.caption}\n\n${CTA_LINE}` : `${RUBRIQUES[0].captionTemplate}\n\n${CTA_LINE}`)
    setResult(null)
  }

  async function publish() {
    setSubmitting(true)
    setResult(null)
    const { ok, data } = await api<{
      publish_id?: string
      reconnect?: boolean
      message?: string
      error?: { message?: string; hint?: string; details?: string[] }
    }>('/api/tiktok/admin/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoUrl,
        caption: caption.trim(),
        privacyLevel: privacy,
        allowComment,
        allowDuet,
        allowStitch,
        commercial: { enabled: commercialOn, yourBrand: commercialOn && commercialKind === 'brand', brandedContent: commercialOn && commercialKind === 'branded' },
        isAigc,
        consent,
      }),
    })
    setSubmitting(false)
    if (ok && data?.publish_id) return setResult({ kind: 'started', publishId: data.publish_id })
    if (data?.reconnect) return setConnection({ kind: 'disconnected', reconnect: true, message: data.message })
    setResult({ kind: 'error', message: data?.error?.hint ?? data?.error?.message ?? 'La publication a échoué.' })
  }

  // Suivi de la publication : interrogation de TikTok toutes les 5 s (3 minutes maximum).
  const publishId = result?.kind === 'started' ? result.publishId : null
  const terminal = result?.kind === 'started' && (result.status === 'PUBLISH_COMPLETE' || result.status === 'FAILED')
  useEffect(() => {
    if (!publishId || terminal) return
    let tries = 0
    const timer = window.setInterval(async () => {
      tries += 1
      const { ok, data } = await api<{ status?: string; fail_reason?: string }>(`/api/tiktok/admin/publish?publish_id=${encodeURIComponent(publishId)}`)
      if (ok && data?.status) setResult((current) => (current?.kind === 'started' && current.publishId === publishId ? { ...current, status: data.status, failReason: data.fail_reason } : current))
      if (tries >= 36) window.clearInterval(timer)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [publishId, terminal])

  async function disconnectAccount() {
    if (!window.confirm('Déconnecter le compte TikTok ? Les jetons seront révoqués et supprimés.')) return
    await api('/api/tiktok/admin/connect', { method: 'DELETE' })
    setResult(null)
    setBanner({ tone: 'ok', text: 'Compte TikTok déconnecté.' })
    void refresh()
  }

  async function closeSession() {
    await api('/api/tiktok/admin/session', { method: 'DELETE' })
    window.location.assign('/')
  }

  return (
    <div className="min-h-screen bg-paper pb-20">
      {/* Remontés dans <head> par React 19 : présents uniquement une fois authentifié. */}
      <title>Espace interne | Yallah Services</title>
      <meta name="robots" content="noindex, nofollow, noarchive" />
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="eyebrow">Espace interne</p>
            <h1 className="font-serif text-2xl leading-tight">Publication TikTok</h1>
          </div>
          <button type="button" onClick={closeSession} className="btn btn-outline btn-sm">
            <LogOut size={16} aria-hidden="true" /> Quitter
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-5 pt-6">
        {banner && (
          <p role="status" className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-semibold ${banner.tone === 'ok' ? 'border-wa/30 bg-wa/10 text-wa-deep' : 'border-coral-strong/30 bg-coral/10 text-coral-deep'}`}>
            {banner.tone === 'ok' ? <CheckCircle2 size={18} aria-hidden="true" className="mt-0.5 shrink-0" /> : <AlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0" />}
            {banner.text}
          </p>
        )}

        {/* Connexion du compte */}
        <section aria-labelledby="compte" className="rounded-3xl border border-line bg-white p-6">
          <h2 id="compte" className="font-serif text-xl">Compte TikTok</h2>
          {connection.kind === 'loading' && (
            <p className="mt-3 flex items-center gap-2 text-sm text-stone"><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Chargement…</p>
          )}
          {connection.kind === 'error' && <p className="mt-3 text-sm font-semibold text-coral-deep">{connection.message}</p>}
          {connection.kind === 'disconnected' && (
            <div className="mt-3">
              <p className="text-sm leading-6 text-stone">
                {connection.reconnect ? (connection.message ?? 'La session TikTok a expiré.') : `Connectez le compte officiel ${SITE.socials.tiktok.handle} pour publier.`}{' '}
                Permissions demandées : profil de base et publication de vidéos.
              </p>
              <a href="/api/tiktok/admin/connect" className="btn btn-ink mt-4">
                {connection.reconnect ? 'Reconnecter le compte TikTok' : 'Connecter le compte TikTok'}
              </a>
            </div>
          )}
          {connection.kind === 'connected' && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={connection.creator.avatar_url} alt="" width={48} height={48} referrerPolicy="no-referrer" className="h-12 w-12 rounded-full bg-sand object-cover" />
                <div>
                  <p className="font-semibold">{connection.creator.nickname}</p>
                  <p className="text-sm text-stone">@{connection.creator.username}</p>
                </div>
              </div>
              <button type="button" onClick={disconnectAccount} className="btn btn-outline btn-sm">Déconnecter</button>
              <p className="flex w-full items-start gap-2 text-xs leading-5 text-stone">
                <ShieldCheck size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-wa" />
                {connection.storage === 'upstash'
                  ? 'Jetons chiffrés, conservés dans Upstash Redis et rafraîchis automatiquement : aucune reconnexion quotidienne.'
                  : 'Stockage MÉMOIRE (développement local uniquement) : les jetons seront perdus au redémarrage. Configurez Upstash Redis pour la production.'}
              </p>
            </div>
          )}
        </section>

        {/* Publication */}
        {connection.kind === 'connected' && creator && (
          <form onSubmit={(event) => { event.preventDefault(); if (blockers.length === 0) void publish() }} className="space-y-6 rounded-3xl border border-line bg-white p-6" aria-labelledby="publier">
            <h2 id="publier" className="font-serif text-xl">Publier une vidéo</h2>

            <div>
              <label htmlFor="video" className="text-sm font-semibold">Vidéo</label>
              <select id="video" value={selected} onChange={(event) => chooseVideo(event.target.value)} className={FIELD}>
                {videos.map((item) => (
                  <option key={item.id} value={item.id}>{item.title} · {formatDuration(item.durationSec)}</option>
                ))}
                <option value={CUSTOM}>Autre adresse (domaine vérifié chez TikTok)…</option>
              </select>
              {selected === CUSTOM ? (
                <input type="url" value={customUrl} onChange={(event) => setCustomUrl(event.target.value)} placeholder={`${origin}/videos/ma-video.mp4`} aria-label="Adresse de la vidéo" className={FIELD} />
              ) : video ? (
                <div className="mt-3 flex items-start gap-4">
                  <video src={videoSrc(video)} poster={posterSrc(video)} controls preload="none" playsInline className="aspect-[9/16] w-28 shrink-0 rounded-xl bg-black object-cover" aria-label={`Aperçu : ${video.title}`} />
                  <p className="break-all text-xs leading-5 text-stone">Adresse transmise à TikTok :<br />{videoUrl}</p>
                </div>
              ) : null}
              <p className="mt-2 text-xs leading-5 text-stone">TikTok télécharge la vidéo : elle doit être hébergée sur un domaine ou un préfixe d’URL vérifié dans TikTok for Developers.</p>
            </div>

            <div>
              <div className="flex items-end justify-between gap-3">
                <label htmlFor="legende" className="text-sm font-semibold">Légende</label>
                <span className={`text-xs ${caption.length > CAPTION_MAX_LENGTH ? 'font-bold text-coral-deep' : 'text-stone'}`}>{caption.length} / {CAPTION_MAX_LENGTH}</span>
              </div>
              <textarea id="legende" rows={5} value={caption} onChange={(event) => setCaption(event.target.value)} className={FIELD} aria-describedby="regles" />
              <div className="mt-2 flex flex-wrap gap-2">
                {!hasWhatsAppCta(caption) && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setCaption((current) => `${current.trim()}\n\n${CTA_LINE}`.trim())}>Ajouter l’appel WhatsApp</button>
                )}
                {RUBRIQUES.map((rubrique) => (
                  <button key={rubrique.id} type="button" className="btn btn-outline btn-sm" onClick={() => setCaption(`${rubrique.captionTemplate}\n\n${CTA_LINE}`)}>Modèle : {rubrique.title}</button>
                ))}
              </div>
              <ul id="regles" className="mt-3 space-y-1 text-xs leading-5">
                {captionCheck.ok ? (
                  <li className="flex items-center gap-2 font-semibold text-wa"><CheckCircle2 size={14} aria-hidden="true" /> Légende conforme : appel WhatsApp présent, aucun tarif ferme, aucune coordonnée tierce.</li>
                ) : (
                  captionCheck.errors.map((error) => (
                    <li key={error} className="flex items-start gap-2 font-semibold text-coral-deep"><AlertTriangle size={14} aria-hidden="true" className="mt-0.5 shrink-0" /> {error}</li>
                  ))
                )}
              </ul>
            </div>

            <fieldset>
              <legend className="text-sm font-semibold">Visibilité <span className="font-normal text-stone">(à choisir, aucune valeur par défaut)</span></legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {creator.privacy_level_options.map((option) => (
                  <label key={option} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 text-sm font-semibold ${privacy === option ? 'border-ink bg-ink text-paper' : 'border-line bg-white'}`}>
                    <input type="radio" name="privacy" value={option} checked={privacy === option} onChange={() => setPrivacy(option)} className="h-4 w-4 accent-coral-strong" />
                    {PRIVACY_LABELS[option] ?? option}
                  </label>
                ))}
              </div>
              {creator.privacy_level_options.length === 1 && creator.privacy_level_options[0] === 'SELF_ONLY' && (
                <p className="mt-2 text-xs leading-5 text-stone">Seule la visibilité « Moi uniquement » est proposée : tant que l’application n’a pas passé l’audit TikTok, les publications restent privées.</p>
              )}
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold">Interactions autorisées <span className="font-normal text-stone">(désactivées par défaut)</span></legend>
              <div className="mt-2 space-y-2 text-sm">
                {(
                  [
                    ['Commentaires', allowComment, setAllowComment, creator.comment_disabled],
                    ['Duos', allowDuet, setAllowDuet, creator.duet_disabled],
                    ['Stitch', allowStitch, setAllowStitch, creator.stitch_disabled],
                  ] as const
                ).map(([label, value, setter, disabled]) => (
                  <label key={label} className={`flex items-center gap-3 ${disabled ? 'opacity-50' : ''}`}>
                    <input type="checkbox" checked={value && !disabled} disabled={disabled} onChange={(event) => setter(event.target.checked)} className="h-4 w-4 accent-coral-strong" />
                    Autoriser : {label.toLowerCase()} {disabled && <span className="text-xs text-stone">(désactivé dans les réglages du compte)</span>}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold">Déclaration de contenu</legend>
              <div className="mt-2 space-y-3 text-sm">
                <label className="flex items-start gap-3">
                  <input type="checkbox" checked={commercialOn} onChange={(event) => { setCommercialOn(event.target.checked); if (!event.target.checked) setCommercialKind('') }} className="mt-1 h-4 w-4 accent-coral-strong" />
                  <span>Cette vidéo est un contenu commercial <span className="text-stone">(recommandé : elle promeut Yallah Services)</span></span>
                </label>
                {commercialOn && (
                  <div className="ml-7 space-y-2">
                    <label className="flex items-center gap-3"><input type="radio" name="commercial" checked={commercialKind === 'brand'} onChange={() => setCommercialKind('brand')} className="h-4 w-4 accent-coral-strong" /> Votre marque (promotion de votre propre activité)</label>
                    <label className="flex items-center gap-3"><input type="radio" name="commercial" checked={commercialKind === 'branded'} onChange={() => setCommercialKind('branded')} className="h-4 w-4 accent-coral-strong" /> Contenu de marque (partenariat payé)</label>
                  </div>
                )}
                <label className="flex items-start gap-3">
                  <input type="checkbox" checked={isAigc} onChange={(event) => setIsAigc(event.target.checked)} className="mt-1 h-4 w-4 accent-coral-strong" />
                  <span>Cette vidéo contient des images réalistes générées ou retouchées par IA <span className="text-stone">(obligatoire à déclarer si c’est le cas)</span></span>
                </label>
              </div>
            </fieldset>

            <div className="rounded-2xl bg-sand/70 p-4">
              <label className="flex items-start gap-3 text-sm leading-6">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1.5 h-4 w-4 accent-coral-strong" />
                <span>Je confirme que cette vidéo <strong>n’affiche aucun tarif ferme</strong> et <strong>aucune donnée permettant d’identifier un client ou un candidat</strong> (nom, visage, téléphone, adresse).</span>
              </label>
              <p className="mt-3 text-xs leading-5 text-stone">
                En publiant, vous acceptez la{' '}
                <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Music Usage Confirmation</a> de TikTok
                {commercialOn && commercialKind === 'branded' && (<> et la <a href="https://www.tiktok.com/legal/page/global/bc-policy/en" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Branded Content Policy</a></>)}.
              </p>
            </div>

            {blockers.length > 0 && (
              <ul className="space-y-1 text-xs leading-5 text-stone" aria-label="Points à compléter avant de publier">
                {blockers.map((blocker) => (<li key={blocker}>• {blocker}</li>))}
              </ul>
            )}

            <button type="submit" disabled={blockers.length > 0 || submitting} className="btn btn-coral w-full disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? (<><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Envoi à TikTok…</>) : `Publier sur ${SITE.socials.tiktok.handle}`}
            </button>

            {result?.kind === 'error' && (
              <p role="alert" className="flex items-start gap-3 rounded-2xl border border-coral-strong/30 bg-coral/10 p-4 text-sm font-semibold text-coral-deep">
                <AlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0" /> {result.message}
              </p>
            )}
            {result?.kind === 'started' && (
              <div role="status" className="rounded-2xl border border-wa/30 bg-wa/10 p-4 text-sm text-wa-deep">
                <p className="flex items-center gap-2 font-semibold">
                  {result.status === 'FAILED' ? <AlertTriangle size={18} aria-hidden="true" /> : result.status === 'PUBLISH_COMPLETE' ? <CheckCircle2 size={18} aria-hidden="true" /> : <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
                  {result.status ? (STATUS_LABELS[result.status] ?? result.status) : 'Publication envoyée à TikTok…'}
                </p>
                {result.failReason && <p className="mt-1">Motif : {result.failReason}</p>}
                <p className="mt-1 break-all text-xs opacity-80">publish_id : {result.publishId}</p>
              </div>
            )}
          </form>
        )}
      </main>
    </div>
  )
}
