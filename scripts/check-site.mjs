// Audit statique du dépôt (sans serveur, sans dépendance) : npm run check
//  1. les vidéos de /public/videos ont un nom en kebab-case strict (ni espace, ni accent, ni apostrophe) ;
//  2. toute vidéo / image référencée dans le code existe dans /public (aucun lien cassé) ;
//  3. aucun lien public ne mène à l'espace interne (/connect, /api/tiktok/admin) ;
//  4. les pages légales (confidentialité, conditions) existent, sont réécrites et reliées depuis le pied de page ;
//  5. les routes TikTok sont exactement celles attendues, séparées en auth/ (public) et admin/ (interne) ;
//  6. aucune image de grille tarifaire n'est plus utilisée (le tableau HTML la remplace).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const read = (path) => readFileSync(join(root, path), 'utf8')
const walk = (dir, filter) => {
  const found = []
  for (const name of readdirSync(join(root, dir))) {
    const path = join(dir, name)
    if (statSync(join(root, path)).isDirectory()) found.push(...walk(path, filter))
    else if (filter(path)) found.push(path)
  }
  return found
}

let failures = 0
const check = (label, ok, detail = '') => {
  console.log(`${ok ? '✔' : '✘'} ${label}${!ok && detail ? `\n    ${detail}` : ''}`)
  if (!ok) failures++
}

// 1) noms de fichiers dans /public/videos
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*\.[a-z0-9]+$/
const videoFiles = readdirSync(join(root, 'public/videos'))
const badNames = videoFiles.filter((name) => !KEBAB.test(name))
check(`noms de /public/videos en kebab-case strict (${videoFiles.length} fichiers)`, badNames.length === 0, `non conformes : ${badNames.join(' | ')}`)

// 2) références à /videos/… et /images/… dans le code
const sources = [...walk('app', (p) => /\.(tsx?|css)$/.test(p)), ...walk('components', (p) => /\.tsx?$/.test(p)), ...walk('lib', (p) => /\.ts$/.test(p))]
const referenced = new Set()
for (const file of sources) {
  const code = read(file)
  for (const match of code.matchAll(/['"`](\/(?:videos|images)\/[^'"`$\s]+)['"`]/g)) referenced.add(match[1])
}
// catalogue vidéo : fichiers et posters déduits du seul tableau VIDEOS de lib/videos.ts (hors RUBRIQUES)
const catalog = read('lib/videos.ts')
const videosBlock = catalog.slice(catalog.indexOf('export const VIDEOS'), catalog.indexOf('export const RUBRIQUES'))
for (const match of videosBlock.matchAll(/file:\s*'([^']+)'/g)) referenced.add(`/videos/${match[1]}`)
for (const match of videosBlock.matchAll(/^\s*id:\s*'([^']+)'/gm)) referenced.add(`/images/video-posters/${match[1]}.jpg`)
const missing = [...referenced].filter((path) => !existsSync(join(root, 'public', path)))
check(`toutes les vidéos et images référencées existent (${referenced.size} références)`, missing.length === 0, `introuvables : ${missing.join(', ')}`)
check('aucune image de grille tarifaire n’est encore utilisée', ![...referenced].some((path) => /grille/i.test(path)))

// 3) aucun lien public vers l'espace interne
const publicFiles = [...walk('components/site', (p) => /\.tsx$/.test(p)), 'app/page.tsx', 'app/layout.tsx', 'app/not-found.tsx', 'app/sitemap.xml/route.ts', 'app/robots.ts', 'proxy.ts', 'lib/nav.ts', 'lib/site.ts', 'lib/content.ts']
const leaks = publicFiles.filter((file) => /\/connect|tiktok\/admin/.test(read(file).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')))
check('aucun lien public vers /connect ni /api/tiktok/admin/* (code public hors commentaires)', leaks.length === 0, `références dans : ${leaks.join(', ')}`)

// 4) pages légales
check('pages légales présentes (public/privacy.html, public/terms.html)', existsSync(join(root, 'public/privacy.html')) && existsSync(join(root, 'public/terms.html')))
const config = read('next.config.mjs')
check('réécritures /confidentialite → privacy.html et /cgu → terms.html', /source: '\/confidentialite', destination: '\/privacy\.html'/.test(config) && /source: '\/cgu', destination: '\/terms\.html'/.test(config))
const footer = read('components/site/SiteFooter.tsx')
check('pied de page relié aux deux pages légales', /LEGAL\.privacy\.href/.test(footer) && /LEGAL\.terms\.href/.test(footer))

// 5) routes API attendues : produit 1/2 TikTok + hub d'intégrations + opérations système
const expectedRoutes = [
  // Produit 2 — Direct Post interne
  'app/api/tiktok/admin/callback/route.ts',
  'app/api/tiktok/admin/connect/route.ts',
  'app/api/tiktok/admin/creator-info/route.ts',
  'app/api/tiktok/admin/publish/route.ts',
  'app/api/tiktok/admin/session/route.ts',
  // Produit 1 — Login Kit public
  'app/api/tiktok/auth/callback/route.ts',
  'app/api/tiktok/auth/logout/route.ts',
  'app/api/tiktok/auth/route.ts',
  'app/api/tiktok/auth/status/route.ts',
  // Hub d'intégrations (TikTok, Meta, LinkedIn) : auth/ + publish/ internes, webhooks/ publics (signature)
  'app/api/integrations/tiktok/auth/callback/route.ts',
  'app/api/integrations/tiktok/auth/connect/route.ts',
  'app/api/integrations/tiktok/publish/route.ts',
  'app/api/integrations/tiktok/webhooks/route.ts',
  'app/api/integrations/meta/auth/callback/route.ts',
  'app/api/integrations/meta/auth/connect/route.ts',
  'app/api/integrations/meta/publish/route.ts',
  'app/api/integrations/meta/webhooks/events/route.ts',
  'app/api/integrations/meta/webhooks/deletion/route.ts',
  'app/api/integrations/linkedin/auth/callback/route.ts',
  'app/api/integrations/linkedin/auth/connect/route.ts',
  'app/api/integrations/linkedin/publish/route.ts',
  'app/api/integrations/linkedin/webhooks/route.ts',
  // Opérations système (staff)
  'app/api/admin/system/health/route.ts',
  'app/api/admin/system/cron/refresh-tokens/route.ts',
]
const actualRoutes = walk('app/api', (p) => p.endsWith(`${sep}route.ts`)).map((p) => relative(root, join(root, p)).split(sep).join('/')).sort()
check('routes API = produit 1 (auth/), produit 2 (admin/), hub d’intégrations et opérations système, rien d’autre', JSON.stringify(actualRoutes) === JSON.stringify(expectedRoutes.slice().sort()), `trouvées : ${actualRoutes.join(', ')}`)
// Toutes les routes internes passent par denyUnlessAdmin(), SAUF :
//  - l'ouverture de session (session/route.ts : la clé ADMIN_SECRET est l'authentification) ;
//  - les webhooks (publics, protégés par signature HMAC / challenge / callback de suppression) ;
//  - le cron (public, protégé par le secret CRON_SECRET en temps constant).
const internalRoutes = expectedRoutes.filter(
  (r) =>
    (r.includes('tiktok/admin/') && !r.endsWith('/session/route.ts')) ||
    r.includes('integrations/') && r.includes('/auth/') ||
    (r.includes('integrations/') && r.includes('/publish/')) ||
    r === 'app/api/admin/system/health/route.ts',
)
check('chaque route interne (hors session, webhooks et cron) passe par denyUnlessAdmin()', internalRoutes.every((r) => /denyUnlessAdmin/.test(read(r))))
// Les webhooks publics ne doivent jamais exposer l'espace interne ni renvoyer un « ok » sans vérification.
const webhookRoutes = expectedRoutes.filter((r) => r.includes('/webhooks/'))
check('chaque route webhook vérifie une signature, un challenge ou un secret (échec fermé)', webhookRoutes.every((r) => /safeEqual|challenge/.test(read(r))))
const publicScope = /SCOPE_LOGIN/.test(read('app/api/tiktok/auth/route.ts')) && !/video\.publish|SCOPE_DIRECT_POST/.test(read('app/api/tiktok/auth/route.ts'))
check('le Login Kit public ne demande que « user.info.basic » (aucune référence à video.publish)', publicScope)

console.log(failures === 0 ? '\nAudit : tout est conforme.' : `\nAudit : ${failures} point(s) à corriger.`)
process.exit(failures === 0 ? 0 : 1)
