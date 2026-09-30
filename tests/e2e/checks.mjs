// Tests de bout en bout : backend TikTok (Login Kit public + espace interne Direct Post) et i18n.
// Lancés par tests/e2e/run.mjs (npm run test:e2e) contre le site en mode production, avec un faux TikTok
// et un faux Upstash : aucun vrai compte, aucun vrai secret. Ils couvrent notamment :
//  - séparation public / interne, scopes demandés, alias d'URI historiques, absence de stockage côté visiteur ;
//  - espace interne invisible (404 neutre), clé d'accès, cookies altérés ou détournés, anti-CSRF ;
//  - jetons chiffrés en base, rafraîchissement automatique, rotation du refresh_token, révocation ;
//  - règles éditoriales (CTA WhatsApp, aucun tarif ferme, aucune coordonnée tierce) appliquées côté serveur.
const BASE = process.env.BASE || 'http://127.0.0.1:3000'
const PROD = process.env.PROD === '1'
const MOCK = process.env.MOCK || 'http://127.0.0.1:4310'
const KV = process.env.KV || 'http://127.0.0.1:4311'
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'test-admin-secret-0123456789abcdef'

let pass = 0
const failures = []
function check(name, cond, detail = '') {
  if (cond) { pass++; console.log(`  ✔ ${name}`) } else { failures.push(name); console.log(`  ✘ ${name}${detail ? '  → ' + detail : ''}`) }
}
const section = (t) => console.log(`\n■ ${t}`)

class Jar {
  constructor() { this.c = new Map(); this.attrs = new Map() }
  ingest(res) {
    for (const line of res.headers.getSetCookie()) {
      const [pair, ...attrs] = line.split(/;\s*/)
      const i = pair.indexOf('=')
      const name = pair.slice(0, i), value = pair.slice(i + 1)
      const a = Object.fromEntries(attrs.map((x) => { const [k, ...v] = x.split('='); return [k.toLowerCase(), v.join('=') || true] }))
      this.attrs.set(name, a)
      if (a['max-age'] === '0' || value === '') this.c.delete(name); else this.c.set(name, value)
    }
  }
  header() { return [...this.c].map(([k, v]) => `${k}=${v}`).join('; ') }
  has(n) { return this.c.has(n) }
  get(n) { return this.c.get(n) }
}
async function req(jar, path, opts = {}) {
  const headers = { ...(opts.headers || {}) }
  if (jar && jar.header()) headers.cookie = jar.header()
  const res = await fetch(BASE + path, { redirect: 'manual', ...opts, headers })
  jar?.ingest(res)
  return res
}
const loc = (res) => res.headers.get('location') || ''
const json = async (res) => { try { return await res.json() } catch { return null } }
const kvDump = async () => (await fetch(KV + '/__dump')).json()
const mockLog = async () => (await fetch(MOCK + '/__log')).json()

const tamper = (value) => { const parts = value.split('.'); const d = parts[2]; const i = Math.floor(d.length / 2); parts[2] = d.slice(0, i) + (d[i] === 'A' ? 'B' : 'A') + d.slice(i + 1); return parts.join('.') }
await fetch(MOCK + '/__reset')
await fetch(KV, { method: 'POST', headers: { Authorization: 'Bearer mocktoken' }, body: JSON.stringify(['DEL', 'yallah:tiktok:admin-account:v1']) }) // état initial propre

/* ------------------------------------------------------------------ */
section('PRODUIT 1 — Login Kit public (/api/tiktok/auth/*)')
const visitor = new Jar()
let res = await req(visitor, '/api/tiktok/auth')
check('GET /api/tiktok/auth → 307 vers TikTok', res.status === 307 && loc(res).startsWith('https://www.tiktok.com/v2/auth/authorize/'), `${res.status} ${loc(res)}`)
const authUrl = new URL(loc(res))
check('scope = user.info.basic UNIQUEMENT (pas de video.publish)', authUrl.searchParams.get('scope') === 'user.info.basic', authUrl.searchParams.get('scope'))
check('client_key + response_type=code + redirect_uri de TIKTOK_REDIRECT_URI', authUrl.searchParams.get('client_key') === 'ck_test' && authUrl.searchParams.get('response_type') === 'code' && authUrl.searchParams.get('redirect_uri') === 'https://yallahservices.vercel.app/api/tiktok/auth/callback')
check('pas de PKCE (flux Web documenté)', !authUrl.searchParams.has('code_challenge'))
if (PROD) check('PRODUCTION : cookie de state marqué Secure', visitor.attrs.get('yallah_tt_login_state')?.secure === true)
check('cookie de state HttpOnly + SameSite=Lax', visitor.has('yallah_tt_login_state') && visitor.attrs.get('yallah_tt_login_state').httponly && String(visitor.attrs.get('yallah_tt_login_state').samesite).toLowerCase() === 'lax')
const state = authUrl.searchParams.get('state')
check('state aléatoire de 48 caractères hex', /^[0-9a-f]{48}$/.test(state))

res = await req(new Jar(), '/api/auth/tiktok')
check('alias historique /api/auth/tiktok → même redirection (scope public)', res.status === 307 && new URL(loc(res)).searchParams.get('scope') === 'user.info.basic')

let anon = new Jar()
res = await req(anon, '/api/tiktok/auth/callback?code=GOOD_LOGIN&state=forged')
check('callback sans cookie de state → /?tiktok=error (aucun échange de jeton)', res.status === 303 && loc(res) === '/?tiktok=error#contact', `${res.status} ${loc(res)}`)
let log = await mockLog()
check('… et le faux TikTok n’a reçu AUCUN échange de code', !log.some((e) => e.path === '/v2/oauth/token/'))

res = await req(visitor, `/api/tiktok/auth/callback?code=BAD&state=${state}`)
check('code refusé par TikTok → /?tiktok=error', res.status === 303 && loc(res) === '/?tiktok=error#contact', loc(res))

// Nouveau parcours complet réussi
const v2 = new Jar()
res = await req(v2, '/api/tiktok/auth')
const state2 = new URL(loc(res)).searchParams.get('state')
res = await req(v2, `/api/tiktok/auth/callback?code=GOOD_LOGIN&state=${state2}`)
check('callback valide → 303 /?tiktok=connected#contact', res.status === 303 && loc(res) === '/?tiktok=connected#contact', `${res.status} ${loc(res)}`)
check('cookie visiteur posé, HttpOnly, Lax', v2.has('yallah_visitor') && v2.attrs.get('yallah_visitor').httponly && String(v2.attrs.get('yallah_visitor').samesite).toLowerCase() === 'lax')
check('cookie de state effacé après usage', !v2.has('yallah_tt_login_state'))
check('le cookie visiteur ne contient ni jeton TikTok ni « act. »', !decodeURIComponent(v2.get('yallah_visitor')).includes('act.') && !v2.get('yallah_visitor').includes('SECRETACCESS'))
log = await mockLog()
const tokenCall = log.find((e) => e.path === '/v2/oauth/token/' && e.code === 'GOOD_LOGIN')
check('échange de code: client_secret envoyé, redirect_uri correct, sans code_verifier', tokenCall && tokenCall.has_secret && tokenCall.redirect_uri === 'https://yallahservices.vercel.app/api/tiktok/auth/callback' && tokenCall.code_verifier === null, JSON.stringify(tokenCall))
check('profil lu avec fields=open_id,avatar_url,display_name', log.some((e) => e.path === '/v2/user/info/' && e.query === '?fields=open_id,avatar_url,display_name'))
check('jeton du visiteur RÉVOQUÉ juste après lecture du profil', log.some((e) => e.path === '/v2/oauth/revoke/' && e.token_prefix.startsWith('act.')))
check('rien n’est stocké dans Redis pour un visiteur', Object.keys(await kvDump()).length === 0)

res = await req(v2, '/api/tiktok/auth/status')
let body = await json(res)
check('GET /api/tiktok/auth/status (connecté) → nom + avatar', body?.connected === true && body.profile.display_name === 'Sara 🌸 Test' && body.profile.avatar_url.startsWith('https://'), JSON.stringify(body))
check('status: Cache-Control no-store', (res.headers.get('cache-control') || '').includes('no-store'))
res = await req(new Jar(), '/api/tiktok/auth/status')
check('status sans cookie → connected:false', (await json(res))?.connected === false)
const tampered = new Jar(); tampered.c.set('yallah_visitor', tamper(v2.get('yallah_visitor')))
res = await req(tampered, '/api/tiktok/auth/status')
check('cookie visiteur altéré (1 caractère) → rejeté', (await json(res))?.connected === false)

// alias historiques du callback
for (const path of ['/api/auth/callback', '/api/tiktok/callback']) {
  const j = new Jar(); let r = await req(j, '/api/tiktok/auth'); const st = new URL(loc(r)).searchParams.get('state')
  r = await req(j, `${path}?code=GOOD_LOGIN&state=${st}`)
  check(`alias ${path} → même callback public (connecté)`, r.status === 303 && loc(r) === '/?tiktok=connected#contact', `${r.status} ${loc(r)}`)
}
res = await req(new Jar(), '/api/tiktok/auth/callback?error=access_denied&state=x')
check('refus de l’utilisateur (error=access_denied) → /?tiktok=denied', res.status === 303 && loc(res) === '/?tiktok=denied#contact', loc(res))

res = await req(v2, '/api/tiktok/auth/logout', { method: 'POST' })
check('POST /api/tiktok/auth/logout efface le cookie', !v2.has('yallah_visitor'))

/* ------------------------------------------------------------------ */
section('Anciennes routes (contenus décalés) : supprimées, plus aucun écrasement')
for (const p of ['/api/tiktok/connect', '/api/tiktok/creator-info', '/api/tiktok/publish', '/api/tiktok/status']) {
  res = await req(new Jar(), p)
  check(`GET ${p} → 404 (n’existe plus)`, res.status === 404, String(res.status))
}

/* ------------------------------------------------------------------ */
section('PRODUIT 2 — espace interne : invisible sans session admin')
anon = new Jar()
for (const [m, p] of [['GET', '/api/tiktok/admin/connect'], ['GET', '/api/tiktok/admin/creator-info'], ['POST', '/api/tiktok/admin/publish'], ['GET', '/api/tiktok/admin/publish?publish_id=x'], ['GET', '/api/tiktok/admin/callback?code=x&state=y'], ['DELETE', '/api/tiktok/admin/connect'], ['DELETE', '/api/tiktok/admin/session']]) {
  res = await req(anon, p, { method: m })
  const b = await json(res)
  check(`${m} ${p} → 404 neutre`, res.status === 404 && b?.error === 'not_found', `${res.status} ${JSON.stringify(b)}`)
}
res = await req(anon, '/connect')
const connectHtml = await res.text()
check('GET /connect (visiteur) → 404 HTML', res.status === 404 && /404|introuvable|not be found/i.test(connectHtml), String(res.status))
const t0 = Date.now()
res = await req(anon, '/connect?key=MAUVAISE-CLE')
const wrongKeyHtml = await res.text()
check('GET /connect?key=fausse → 404 HTML + freinage', res.status === 404 && /text\/html/.test(res.headers.get('content-type') || '') && Date.now() - t0 >= 600, `${res.status} en ${Date.now() - t0} ms`)
const ratio = wrongKeyHtml.length / connectHtml.length
check('… page strictement comparable à /connect seul (même statut, même type, même taille à ±3 %)', res.status === 404 && ratio > 0.97 && ratio < 1.03, `taille ${wrongKeyHtml.length} vs ${connectHtml.length}`)
const unknownRes = await req(anon, '/page-qui-nexiste-pas')
const unknown = await unknownRes.text()
check('404 de /connect : AUCUN indice (ni « Espace interne », ni « Publication TikTok », ni « admin » dans le HTML)', !/Espace interne|Publication TikTok|AdminPanel|admin/i.test(connectHtml) && !/Espace interne|Publication TikTok|AdminPanel|admin/i.test(wrongKeyHtml))
const hdrs = (r) => ['x-robots-tag', 'content-type'].map((h) => `${h}=${r.headers.get(h)}`).join(';')
const r404 = await req(anon, '/connect')
check('404 de /connect : mêmes en-têtes distinctifs qu’une URL inconnue (pas de X-Robots-Tag propre)', hdrs(r404) === hdrs(unknownRes), hdrs(r404) + ' vs ' + hdrs(unknownRes))
await r404.text()
check('… et de même ordre de grandeur qu’une URL inconnue quelconque (±25 %)', Math.abs(wrongKeyHtml.length - unknown.length) / unknown.length < 0.25, `${wrongKeyHtml.length} vs ${unknown.length}`)
check('cookie admin non posé avec une fausse clé', !anon.has('yallah_admin'))

/* ------------------------------------------------------------------ */
section('PRODUIT 2 — ouverture de session admin via /connect?key=')
const admin = new Jar()
res = await req(admin, `/connect?key=${ADMIN_SECRET}`)
check('clé valide : la page /connect renvoie vers la route de session (redirection HTTP réelle)', [307, 308].includes(res.status) && loc(res).startsWith('/api/tiktok/admin/session?key='), `${res.status} ${loc(res).slice(0, 60)}`)
res = await req(admin, loc(res))
check('route de session → 303 vers /connect SANS la clé dans l’URL', res.status === 303 && loc(res) === '/connect', `${res.status} ${loc(res)}`)
check('cookie admin HttpOnly, Lax, valeur chiffrée', admin.has('yallah_admin') && admin.attrs.get('yallah_admin').httponly && String(admin.attrs.get('yallah_admin').samesite).toLowerCase() === 'lax' && !admin.get('yallah_admin').includes(ADMIN_SECRET))
res = await req(admin, '/connect')
const adminHtml = await res.text()
check('GET /connect avec cookie admin → 200', res.status === 200, String(res.status))
check('/connect authentifié : pas de mise en cache + noindex posé par la page elle-même', (PROD ? /no-store/ : /no-store|no-cache/).test(res.headers.get('cache-control') || '') && /<meta name="robots" content="noindex, nofollow, noarchive"/.test(adminHtml), res.headers.get('cache-control'))
if (PROD) check('PRODUCTION : cookie admin marqué Secure', admin.attrs.get('yallah_admin')?.secure === true)

// Un cookie visiteur ne doit JAMAIS ouvrir l'espace admin (séparation des usages de clé)
const fake = new Jar(); fake.c.set('yallah_admin', (await (async () => { const j = new Jar(); let r = await req(j, '/api/tiktok/auth'); const st = new URL(loc(r)).searchParams.get('state'); await req(j, `/api/tiktok/auth/callback?code=GOOD_LOGIN&state=${st}`); return j.get('yallah_visitor') })()))
res = await req(fake, '/api/tiktok/admin/creator-info')
check('cookie visiteur rejoué comme cookie admin → 404', res.status === 404)
const tamperedAdmin = new Jar(); tamperedAdmin.c.set('yallah_admin', tamper(admin.get('yallah_admin')))
res = await req(tamperedAdmin, '/api/tiktok/admin/creator-info')
check('cookie admin altéré → 404', res.status === 404)

/* ------------------------------------------------------------------ */
section('PRODUIT 2 — connexion du compte @yallah.services.m (Direct Post)')
res = await req(admin, '/api/tiktok/admin/creator-info')
body = await json(res)
check('avant connexion : { connected:false }', res.status === 200 && body?.connected === false, JSON.stringify(body))
res = await req(admin, '/api/tiktok/admin/connect')
const adminAuth = new URL(loc(res))
check('GET admin/connect → 307 TikTok avec scopes user.info.basic + video.publish', res.status === 307 && adminAuth.searchParams.get('scope') === 'user.info.basic,video.publish', `${res.status} ${adminAuth.searchParams.get('scope')}`)
check('redirect_uri admin DISTINCTE, dérivée de TIKTOK_REDIRECT_URI', adminAuth.searchParams.get('redirect_uri') === 'https://yallahservices.vercel.app/api/tiktok/admin/callback', adminAuth.searchParams.get('redirect_uri'))
check('cookie de state ADMIN distinct du cookie public', admin.has('yallah_tt_admin_state') && !admin.has('yallah_tt_login_state'))
const adminState = adminAuth.searchParams.get('state')

res = await req(admin, `/api/tiktok/admin/callback?code=GOOD_ADMIN&state=mauvais`)
check('callback admin avec mauvais state → /connect?error=state_mismatch', loc(res) === '/connect?error=state_mismatch', loc(res))
res = await req(admin, '/api/tiktok/admin/connect'); const st3 = new URL(loc(res)).searchParams.get('state')
res = await req(admin, `/api/tiktok/admin/callback?code=NOSCOPE&state=${st3}`)
check('scope video.publish non accordé → /connect?error=scope_missing (rien stocké)', loc(res) === '/connect?error=scope_missing' && Object.keys(await kvDump()).length === 0, loc(res))
res = await req(admin, '/api/tiktok/admin/connect'); const st4 = new URL(loc(res)).searchParams.get('state')
res = await req(admin, `/api/tiktok/admin/callback?code=GOOD_ADMIN&state=${st4}`)
check('callback admin valide → /connect?connected=1', res.status === 303 && loc(res) === '/connect?connected=1', `${res.status} ${loc(res)}`)
log = await mockLog()
const adminTok = log.filter((e) => e.path === '/v2/oauth/token/' && e.code === 'GOOD_ADMIN').pop()
check('échange admin avec la redirect_uri admin', adminTok?.redirect_uri === 'https://yallahservices.vercel.app/api/tiktok/admin/callback', JSON.stringify(adminTok))
check('aucun jeton dans les cookies admin', !admin.header().includes('SECRETACCESS') && !admin.header().includes('SECRETREFRESH') && !admin.header().includes('act.'))

let dump = await kvDump()
const keys = Object.keys(dump)
check('jetons écrits dans le stockage durable (Upstash) sous une clé unique', keys.length === 1 && keys[0] === 'yallah:tiktok:admin-account:v1', keys.join(','))
const stored = dump[keys[0]]
check('valeur stockée CHIFFRÉE : ni access_token, ni refresh_token, ni open_id en clair', !stored.value.includes('SECRETACCESS') && !stored.value.includes('SECRETREFRESH') && !stored.value.includes('open-id-admin') && /^[\w-]+\.[\w-]+\.[\w-]+$/.test(stored.value), stored.value.slice(0, 60))
check('TTL posé = durée du refresh_token (≈ 365 jours)', stored.ttl > 360 * 86400 && stored.ttl <= 365 * 86400 + 5, String(stored.ttl))

/* ------------------------------------------------------------------ */
section('PRODUIT 2 — rafraîchissement automatique + rotation du refresh_token')
const before = stored.value
const mockState = async () => (await fetch(MOCK + '/__state')).json()
const tokenAtCallback = (await mockState()).currentAccess
res = await req(admin, '/api/tiktok/admin/creator-info')
body = await json(res)
check('creator-info → connecté, avec le compte et ses réglages', res.status === 200 && body?.connected === true && body.creator.username === 'yallah.services.m' && body.creator.privacy_level_options.includes('SELF_ONLY'), JSON.stringify(body)?.slice(0, 200))
check('storage déclaré = upstash', body?.storage === 'upstash')
log = await mockLog()
const refresh1 = log.filter((e) => e.path === '/v2/oauth/token/' && e.grant === 'refresh_token')
check('jeton (60 s) proche de l’expiration → refresh_token appelé automatiquement', refresh1.length === 1, String(refresh1.length))
let st = await mockState()
const creatorCall = log.filter((e) => e.path === '/v2/post/publish/creator_info/query/').pop()
check('l’appel TikTok utilise le jeton RAFRAÎCHI (le faux TikTok refuse l’ancien)', creatorCall?.bearer === st.currentAccess && creatorCall.bearer !== tokenAtCallback, `${creatorCall?.bearer} vs courant ${st.currentAccess}`)
dump = await kvDump()
check('le nouveau jeton est réécrit chiffré dans Redis', dump[keys[0]].value !== before && !dump[keys[0]].value.includes('SECRETACCESS'))
const refreshTokenUsed1 = refresh1[0]
res = await req(admin, '/api/tiktok/admin/creator-info'); body = await json(res)
log = await mockLog()
const refresh2 = log.filter((e) => e.path === '/v2/oauth/token/' && e.grant === 'refresh_token')
check('2e rafraîchissement OK : le NOUVEAU refresh_token (rotation) a été réutilisé', body?.connected === true && refresh2.length === 2, `${refresh2.length} refresh, connected=${body?.connected}`)
res = await req(admin, '/api/tiktok/admin/creator-info'); body = await json(res)
log = await mockLog()
check('3e appel : jeton 24 h → plus aucun rafraîchissement', body?.connected === true && log.filter((e) => e.grant === 'refresh_token').length === 2)

/* ------------------------------------------------------------------ */
section('PRODUIT 2 — publication : règles éditoriales et garde-fous serveur')
const OK_CAPTION = 'Besoin d’une femme de ménage à Casablanca ? Des profils sélectionnés. #LeBonProfilDuJour\n\n📲 WhatsApp : +212 691 733 585'
const VIDEO = 'https://yallahservices.vercel.app/videos/besoin-d-aide-a-domicile.mp4'
const good = { videoUrl: VIDEO, caption: OK_CAPTION, privacyLevel: 'SELF_ONLY', allowComment: true, allowDuet: false, allowStitch: true, commercial: { enabled: true, yourBrand: true, brandedContent: false }, isAigc: false, consent: true }
const post = (b, extra = {}) => req(admin, '/api/tiktok/admin/publish', { method: 'POST', headers: { 'content-type': 'application/json', ...extra }, body: JSON.stringify(b) })
const expectReject = async (name, patch, code) => { const r = await post({ ...good, ...patch }); const b = await json(r); check(name, r.status === 400 && b?.error?.code === code, `${r.status} ${JSON.stringify(b)?.slice(0, 160)}`) }

await expectReject('sans confirmation éditoriale → refusé', { consent: false }, 'consent_required')
await expectReject('légende SANS appel WhatsApp → refusé', { caption: 'Besoin de ménage ? #YallahServices' }, 'caption_rules')
await expectReject('légende avec un TARIF FERME (3 500 DH) → refusé', { caption: 'Ménage dès 3 500 DH ! 📲 WhatsApp : +212 691 733 585' }, 'caption_rules')
await expectReject('légende avec prix en € → refusé', { caption: 'Seulement 50€ la séance 📲 WhatsApp : +212 691 733 585' }, 'caption_rules')
await expectReject('légende avec le numéro d’un tiers → refusé', { caption: 'Appelez Fatima au 06 12 34 56 78 📲 WhatsApp : +212 691 733 585' }, 'caption_rules')
await expectReject('légende avec l’e-mail d’un tiers → refusé', { caption: 'Écrivez à sara.b@gmail.com 📲 WhatsApp : +212 691 733 585' }, 'caption_rules')
await expectReject('vidéo hébergée ailleurs (youtube) → refusée', { videoUrl: 'https://www.youtube.com/watch?v=abc' }, 'video_url')
await expectReject('vidéo en http:// → refusée', { videoUrl: 'http://yallahservices.vercel.app/videos/x.mp4' }, 'video_url')
await expectReject('aucune visibilité choisie (pas de valeur par défaut) → refusé', { privacyLevel: '' }, 'privacy_required')
await expectReject('visibilité absente des options TikTok → refusé', { privacyLevel: 'FOLLOWER_OF_CREATOR' }, 'privacy_required')
await expectReject('contenu de marque + privé → refusé', { commercial: { enabled: true, yourBrand: false, brandedContent: true } }, 'branded_content_private')
await expectReject('contenu commercial activé sans type → refusé', { commercial: { enabled: true, yourBrand: false, brandedContent: false } }, 'commercial_choice_required')

let r = await post(good, { origin: 'https://evil.example' })
check('requête d’écriture avec Origin étranger → 403 (anti-CSRF)', r.status === 403, String(r.status))
r = await post(good)
body = await json(r)
check('publication valide → 200 + publish_id', r.status === 200 && body?.ok === true && body.publish_id === 'v_pub_url~mock123', `${r.status} ${JSON.stringify(body)}`)
const inits = await (await fetch(MOCK + '/__inits')).json()
const sent = inits.at(-1)
check('TikTok reçoit: titre = légende exacte, PULL_FROM_URL, URL de la vidéo', sent?.post_info?.title === OK_CAPTION && sent.source_info.source === 'PULL_FROM_URL' && sent.source_info.video_url === VIDEO)
check('interactions: commentaire autorisé (choix), duo interdit (défaut), stitch interdit (désactivé par le créateur)', sent?.post_info?.disable_comment === false && sent.post_info.disable_duet === true && sent.post_info.disable_stitch === true, JSON.stringify(sent?.post_info))
check('déclaration commerciale « ma marque » transmise', sent?.post_info?.brand_organic_toggle === true && sent.post_info.brand_content_toggle === false && sent.post_info.is_aigc === false)
check('l’appel publish utilise le jeton courant', (await mockLog()).filter((e) => e.path === '/v2/post/publish/video/init/').pop()?.bearer === (await (await fetch(MOCK + '/__state')).json()).currentAccess)

r = await post({ ...good, videoUrl: 'https://yallahservices.vercel.app/videos/unverified.mp4' })
body = await json(r)
check('erreur TikTok « url_ownership_unverified » → message clair + explication en français', r.status === 502 && body?.error?.code === 'url_ownership_unverified' && /URL properties/.test(body.error.hint || ''), `${r.status} ${JSON.stringify(body)}`)

r = await req(admin, '/api/tiktok/admin/publish?publish_id=v_pub_url~mock123'); body = await json(r)
check('GET publish?publish_id= → statut de publication', r.status === 200 && body?.ok === true && typeof body.status === 'string', JSON.stringify(body))
r = await req(admin, '/api/tiktok/admin/publish'); check('GET publish sans publish_id → 400', r.status === 400)

/* ------------------------------------------------------------------ */
section('PRODUIT 2 — déconnexion du compte et de la session')
r = await req(admin, '/api/tiktok/admin/connect', { method: 'DELETE' })
body = await json(r)
check('DELETE admin/connect → connected:false', r.status === 200 && body?.connected === false)
check('jeton révoqué côté TikTok', (await mockLog()).some((e) => e.path === '/v2/oauth/revoke/' && e.token_prefix.startsWith('act.SECRETACCE')))
check('jetons supprimés de Redis', Object.keys(await kvDump()).length === 0)
r = await req(admin, '/api/tiktok/admin/creator-info'); body = await json(r)
check('creator-info après déconnexion → connected:false', body?.connected === false)
r = await req(admin, '/api/tiktok/admin/session', { method: 'DELETE' })
check('DELETE admin/session ferme la session (cookie supprimé)', r.status === 200 && !admin.has('yallah_admin'))
r = await req(admin, '/connect'); await r.text()
check('/connect de nouveau 404 après fermeture', r.status === 404)

/* ------------------------------------------------------------------ */
section('MULTI-LANGUE — résolution, persistance, RTL et hreflang (bout en bout, vrai HTTP)')
const jarLang = new Jar()
// Requête en suivant les redirections avec les cookies d'un bocal : c'est le comportement d'un navigateur.
const followAs = async (j, path, opts = {}) => {
  const res = await fetch(BASE + path, { ...opts, headers: { ...(opts.headers || {}), cookie: j.header() } })
  return { res, html: await res.text() }
}
const htmlLang = (h) => (h.match(/<html[^>]*lang="([^"]+)"[^>]*>/) || [])[1] || ''
const htmlDir = (h) => (h.match(/<html[^>]*dir="([^"]+)"[^>]*>/) || [])[1] || ''
const arabicSentence = 'البروفيل المناسب، فالمكان المناسب.'

r = await req(jarLang, '/?lang=ar')
check('?lang=ar → renvoi vers l\'adresse canonique (URL propre, sans paramètre)', r.status === 307 && loc(r) === '/', `${r.status} ${loc(r)}`)
check('… avec le cookie de langue posé par le serveur', jarLang.get('yallah_locale') === 'ar' && jarLang.attrs.get('yallah_locale').path === '/', JSON.stringify([...jarLang.c]))
const ar = await followAs(jarLang, '/')
check('la page rendue est arabe ET en RTL (lang et dir cohérents avec le contenu)', htmlLang(ar.html) === 'ar-MA' && htmlDir(ar.html) === 'rtl' && ar.html.includes(arabicSentence) && !/Discuter sur WhatsApp|Ménage à domicile/.test(ar.html), `${htmlLang(ar.html)} / ${htmlDir(ar.html)}`)
const arWa = decodeURIComponent((ar.html.match(/href="https:\/\/wa\.me\/[^"]+"/) || [''])[0])
check('message WhatsApp pré-rempli dans la langue choisie', arWa.includes('السلام عليكم يالاح سيفيس'), arWa.slice(0, 90))
check('bouton CTA et aria-label traduits en arabe', ar.html.includes('تواصل معنا على واتساب') && /aria-label="[^"]*واتساب[^"]*"/.test(ar.html))
const arLtr = await followAs(new Jar(), '/?lang=fr')
const frHtml = arLtr.html
check('le même titre français est bien rendu en LTR avec une devise non arabophone', htmlLang(frHtml) === 'fr-MA' && htmlDir(frHtml) === 'ltr' && frHtml.includes('Le bon profil, au bon endroit.'), `${htmlLang(frHtml)} / ${htmlDir(frHtml)}`)
check('les trois langues partagent le même squelette (mêmes ancres, mêmes sections)', (frHtml.match(/<section id="/g) || []).length === (ar.html.match(/<section id="/g) || []).length && (ar.html.match(/<section id="/g) || []).length > 8, `${(frHtml.match(/<section id="/g) || []).length} vs ${(ar.html.match(/<section id="/g) || []).length}`)

const enByHeader = await fetch(BASE + '/', { headers: { 'accept-language': 'en-US,en;q=0.8,fr;q=0.5' } })
const enFreshHtml = await enByHeader.text()
check('première visite : langue devinée depuis Accept-Language (sans cookie)', htmlLang(enFreshHtml) === 'en-MA' && enFreshHtml.includes('The right profile, in the right place.'), htmlLang(enFreshHtml))
check('… et la devinette est mémorisée dans le cookie pour la visite suivante', (enByHeader.headers.get('set-cookie') || '').includes('yallah_locale=en'), enByHeader.headers.get('set-cookie'))
const jarEn = new Jar(); await req(jarEn, '/', { headers: { 'accept-language': 'en-US,en;q=0.8' } })
const enThenAr = await followAs(jarEn, '/?lang=ar')
check('la préférence explicite prime sur Accept-Language à la requête suivante', htmlLang(enThenAr.html) === 'ar-MA' && htmlDir(enThenAr.html) === 'rtl', htmlLang(enThenAr.html))

r = await req(new Jar(), '/?lang=xx')
check('langue inconnue (?lang=xx) → aucune redirection ni erreur', r.status === 200, String(r.status))
const jarOk = new Jar(); await req(jarOk, '/?lang=fr'); await req(jarOk, '/?lang=fr')
const jarTwice = new Jar(); await req(jarTwice, '/?lang=fr')
r = await req(jarTwice, '/?lang=fr')
check('langue déjà conforme au cookie → pas de redirection de trop', r.status === 200, `${r.status} ${loc(r)}`)

const sm = await (await fetch(BASE + '/sitemap.xml')).text()
check('sitemap.xml déclare les trois adresses et leurs hreflang', sm.includes('?lang=ar') && sm.includes('hreflang="ar-MA"') && sm.includes('hreflang="x-default"') && sm.includes('xmlns:xhtml'))
check('robots.txt pointe vers le sitemap', /sitemap.*\.xml/.test(await (await fetch(BASE + '/robots.txt')).text()))
check('sélecteur de langue rendu accessible (aria-pressed) et dans le sens RTL', /aria-pressed="true"/.test(ar.html) && /aria-pressed="false"/.test(ar.html) && ar.html.includes('>AR<'))
const headConnect = await req(null, '/connect?lang=ar')
check('espace interne : la normalisation de langue ne le touche pas (ni cookie, ni redirection)', [200, 404].includes(headConnect.status) && !(headConnect.headers.get('set-cookie') || '').includes('yallah_locale') && !loc(headConnect), `${headConnect.status} loc=${loc(headConnect) || '—'} cookie=${headConnect.headers.get('set-cookie') || '—'}`)

console.log(`\n==== ${pass} contrôles réussis, ${failures.length} échec(s) ====`)
if (failures.length) { console.log('ÉCHECS:\n - ' + failures.join('\n - ')); process.exit(1) }
