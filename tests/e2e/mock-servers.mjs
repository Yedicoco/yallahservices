// Faux TikTok + faux Upstash pour les tests de bout en bout (aucun vrai compte, aucun vrai secret).
//  - Faux TikTok  : OAuth (code, refresh avec ROTATION du refresh_token, revoke), user info, Content Posting API.
//  - Faux Upstash : API REST Redis (commande JSON en POST : GET / SET [EX] / DEL).
// Le faux TikTok émet des jetons d'accès de 60 s pour les deux premiers jetons admin : le rafraîchissement
// automatique est donc réellement exercé par les tests.
import http from 'node:http'

export function startMocks({ tiktokPort, upstashPort }) {
  const log = []                       // journal des appels reçus par le faux TikTok
  const kv = new Map()                 // contenu du faux Redis
  let issued = 0                       // nombre total de jetons émis (noms uniques)
  let adminSeq = 0                     // séquence des jetons ADMIN (+ rafraîchissements) : pilote les durées de vie
  const lifetimes = [60, 60, 86400]    // durée de vie (s) des 3 premiers jetons d'accès : force 2 rafraîchissements
  let currentAccess = null
  let currentRefresh = null
  let initBodies = []
  let statusCalls = 0

  const readBody = (req) => new Promise((resolve) => { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => resolve(b)) })
  const send = (res, status, body) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)) }
  const ok = (data) => ({ data, error: { code: 'ok', message: '', log_id: 'mock' } })


  const tiktok = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x')
    const raw = await readBody(req)
    const auth = req.headers.authorization || ''
    const bearer = auth.replace(/^Bearer /, '')

    if (url.pathname === '/__log') return send(res, 200, log)
    if (url.pathname === '/__inits') return send(res, 200, initBodies)
    if (url.pathname === '/__reset') { log.length = 0; initBodies = []; issued = 0; adminSeq = 0; currentAccess = currentRefresh = null; statusCalls = 0; return send(res, 200, { ok: true }) }
    if (url.pathname === '/__state') return send(res, 200, { currentAccess, currentRefresh, issued, adminSeq })

    if (url.pathname === '/v2/oauth/token/') {
      const form = new URLSearchParams(raw)
      const grant = form.get('grant_type')
      log.push({ path: url.pathname, grant, client_key: form.get('client_key'), has_secret: form.get('client_secret') === 'cs_test', code: form.get('code'), redirect_uri: form.get('redirect_uri'), code_verifier: form.get('code_verifier') })
      if (form.get('client_key') !== 'ck_test' || form.get('client_secret') !== 'cs_test') return send(res, 200, { error: 'invalid_client', error_description: 'Bad client credentials' })
      if (grant === 'authorization_code') {
        const code = form.get('code')
        if (code === 'BAD') return send(res, 200, { error: 'invalid_grant', error_description: 'Authorization code is expired.' })
        const scope = code === 'GOOD_ADMIN' ? 'user.info.basic,video.publish' : code === 'GOOD_LOGIN' ? 'user.info.basic' : code === 'NOSCOPE' ? 'user.info.basic' : null
        if (!scope) return send(res, 200, { error: 'invalid_grant', error_description: 'Unknown code' })
        const isAdmin = code === 'GOOD_ADMIN'
        const life = isAdmin ? lifetimes[Math.min(adminSeq, lifetimes.length - 1)] : 86400
        if (isAdmin) adminSeq += 1
        issued += 1
        currentAccess = `act.SECRETACCESS${issued}`
        currentRefresh = `rft.SECRETREFRESH${issued}`
        return send(res, 200, { access_token: currentAccess, expires_in: life, open_id: 'open-id-admin', refresh_expires_in: 31536000, refresh_token: currentRefresh, scope, token_type: 'Bearer' })
      }
      if (grant === 'refresh_token') {
        if (form.get('refresh_token') !== currentRefresh) return send(res, 200, { error: 'invalid_grant', error_description: 'refresh token mismatch (rotation non respectée)' })
        const life = lifetimes[Math.min(adminSeq, lifetimes.length - 1)]
        adminSeq += 1
        issued += 1
        currentAccess = `act.SECRETACCESS${issued}`
        currentRefresh = `rft.SECRETREFRESH${issued}`   // TikTok peut renvoyer un refresh_token différent : on le simule
        return send(res, 200, { access_token: currentAccess, expires_in: life, open_id: 'open-id-admin', refresh_expires_in: 31536000, refresh_token: currentRefresh, scope: 'user.info.basic,video.publish', token_type: 'Bearer' })
      }
      return send(res, 400, { error: 'unsupported_grant_type' })
    }

    if (url.pathname === '/v2/oauth/revoke/') {
      const form = new URLSearchParams(raw)
      log.push({ path: url.pathname, token_prefix: (form.get('token') || '').slice(0, 14) })
      return send(res, 200, {})
    }

    // Les routes ci-dessous exigent le jeton d'accès COURANT (prouve que le jeton rafraîchi est bien utilisé).
    const isLoginToken = bearer === 'LOGIN_TOKEN_NEVER'
    if (url.pathname === '/v2/user/info/') {
      log.push({ path: url.pathname, query: url.search, bearer_prefix: bearer.slice(0, 14) })
      if (!bearer.startsWith('act.')) return send(res, 401, { error: { code: 'access_token_invalid', message: 'bad token', log_id: 'mock' } })
      return send(res, 200, ok({ user: { open_id: 'open-id-visitor', display_name: 'Sara 🌸 Test', avatar_url: 'https://p16.tiktokcdn.com/avatar.jpeg' } }))
    }
    if (url.pathname === '/v2/post/publish/creator_info/query/') {
      log.push({ path: url.pathname, bearer })
      if (bearer !== currentAccess) return send(res, 401, { error: { code: 'access_token_invalid', message: 'Access token is invalid or not found in the request.', log_id: 'mock' } })
      return send(res, 200, ok({ creator_avatar_url: 'https://p16.tiktokcdn.com/creator.jpeg', creator_username: 'yallah.services.m', creator_nickname: 'Yallah Services', privacy_level_options: ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'SELF_ONLY'], comment_disabled: false, duet_disabled: false, stitch_disabled: true, max_video_post_duration_sec: 600 }))
    }
    if (url.pathname === '/v2/post/publish/video/init/') {
      log.push({ path: url.pathname, bearer })
      if (bearer !== currentAccess) return send(res, 401, { error: { code: 'access_token_invalid', message: 'invalid', log_id: 'mock' } })
      const body = JSON.parse(raw)
      initBodies.push(body)
      if (body.source_info?.video_url?.includes('unverified')) return send(res, 403, { error: { code: 'url_ownership_unverified', message: 'Please review our URL ownership verification documentation.', log_id: 'mock' } })
      return send(res, 200, ok({ publish_id: 'v_pub_url~mock123' }))
    }
    if (url.pathname === '/v2/post/publish/status/fetch/') {
      log.push({ path: url.pathname, bearer })
      statusCalls += 1
      return send(res, 200, ok({ status: statusCalls > 1 ? 'PUBLISH_COMPLETE' : 'PROCESSING_DOWNLOAD' }))
    }
    send(res, 404, { error: { code: 'not_found', message: url.pathname } })  })
  tiktok.listen(tiktokPort, '127.0.0.1')

  const upstash = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x')
    if (url.pathname === '/__dump') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify(Object.fromEntries(kv))) }
    if ((req.headers.authorization || '') !== 'Bearer mocktoken') return send(res, 401, { error: 'WRONGPASS invalid or missing token' })
    const raw = await readBody(req)
    let cmd
    try { cmd = JSON.parse(raw) } catch { return send(res, 400, { error: 'ERR invalid JSON' }) }
    const [name, key, value, ...rest] = cmd
    switch (String(name).toUpperCase()) {
      case 'GET': return send(res, 200, { result: kv.has(key) ? kv.get(key).value : null })
      case 'SET': { const ttl = rest[0] === 'EX' ? Number(rest[1]) : null; kv.set(key, { value, ttl }); return send(res, 200, { result: 'OK' }) }
      case 'DEL': { const had = kv.delete(key); return send(res, 200, { result: had ? 1 : 0 }) }
      default: return send(res, 400, { error: `ERR unknown command '${name}'` })
    }  })
  upstash.listen(upstashPort, '127.0.0.1')

  return { close: () => Promise.all([new Promise((r) => tiktok.close(r)), new Promise((r) => upstash.close(r))]) }
}
