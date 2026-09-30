// Audit i18n du dépôt (sans serveur, sans dépendance) : pnpm check:i18n
//  1. les trois dictionnaires ont exactement la même structure (aucune clé manquante ni superflue) ;
//  2. aucun doublon de clé dans les JSON (`JSON.parse` garde la dernière : un texte disparaîtrait sans bruit) ;
//  3. les modèles {marque} sont les mêmes dans les trois langues (une marque oubliée = message WhatsApp cassé) ;
//  4. les métadonnées de langue sont conformes (dir rtl pour l'arabe, hreflang fr-MA/ar-MA/en-MA) ;
//  5. le contenu exigé par la spécification est présent (devise, services B2C, appel à l'action WhatsApp) ;
//  6. la vitrine n'utilise plus d'utilitaires directionnels figés (ml-*/mr-*/pl-*/pr-*/text-left/text-right) :
//     sans classes logiques, l'interface ne se retourne pas en darija ;
//  7. le sélecteur de langue, le `<html lang dir>` dynamique et les messages WhatsApp traduits sont câblés.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const read = (path) => readFileSync(join(root, path), 'utf8')

let failures = 0
const check = (label, ok, detail = '') => {
  console.log(`${ok ? '✔' : '✘'} ${label}${!ok && detail ? `\n    ${detail}` : ''}`)
  if (!ok) failures++
}

const LOCALES = ['fr', 'ar', 'en']
const EXPECTED = {
  fr: { dir: 'ltr', htmlLang: 'fr-MA', hreflang: 'fr-MA', ogLocale: 'fr_MA', short: 'FR' },
  ar: { dir: 'rtl', htmlLang: 'ar-MA', hreflang: 'ar-MA', ogLocale: 'ar_MA', short: 'AR' },
  en: { dir: 'ltr', htmlLang: 'en-MA', hreflang: 'en-MA', ogLocale: 'en_MA', short: 'EN' },
}

/* ------------------------------------------------------------------ */
/* Lecteur JSON qui signale les clés dupliquées au sein d'un même objet */
/* ------------------------------------------------------------------ */

function parseJsonCheckingDuplicates(text, label) {
  let i = 0
  const duplicates = []

  const fail = (message) => {
    throw new Error(`${label}: ${message} (offset ${i})`)
  }
  const ws = () => {
    while (i < text.length && /[\s]/.test(text[i])) i++
  }
  function parseValue(parentKeys) {
    ws()
    const ch = text[i]
    if (ch === '{') return parseObject(parentKeys)
    if (ch === '[') return parseArray(parentKeys)
    if (ch === '"') return parseString()
    if (ch === 't') {
      if (text.startsWith('true', i)) return (i += 4), true
      return fail('littéral inattendu')
    }
    if (ch === 'f') {
      if (text.startsWith('false', i)) return (i += 5), false
      return fail('littéral inattendu')
    }
    if (ch === 'n') {
      if (text.startsWith('null', i)) return (i += 4), null
      return fail('littéral inattendu')
    }
    const num = /^-?\d+(\.\d+)?([eE][+-]?\d+)?/.exec(text.slice(i))
    if (!num) return fail(`caractère inattendu « ${ch} »`)
    i += num[0].length
    return Number(num[0])
  }
  function parseString() {
    let out = ''
    i++ // guillemet ouvrant
    while (i < text.length) {
      const ch = text[i]
      if (ch === '\\') {
        const next = text[i + 1]
        out += next === 'n' ? '\n' : next === 'u' ? String.fromCharCode(parseInt(text.slice(i + 2, i + 6), 16)) : next
        i += next === 'u' ? 6 : 2
        continue
      }
      i++
      if (ch === '"') return out
      out += ch
    }
    return fail('chaîne non terminée')
  }
  function parseObject(parentKeys) {
    void parentKeys
    const object = {}
    const keys = new Set()
    i++ // '{'
    ws()
    if (text[i] === '}') return i++, object
    for (;;) {
      ws()
      if (text[i] !== '"') fail('clé attendue')
      const key = parseString()
      ws()
      if (text[i] !== ':') fail(`« : » attendu après la clé « ${key} »`)
      i++
      if (keys.has(key)) duplicates.push(`${label}: clé dupliquée « ${key} »`)
      keys.add(key)
      object[key] = parseValue(keys)
      ws()
      if (text[i] === ',') {
        i++
        continue
      }
      if (text[i] === '}') {
        i++
        return object
      }
      fail('« , » ou « } » attendu')
    }
  }
  function parseArray() {
    const items = []
    i++ // '['
    ws()
    if (text[i] === ']') return i++, items
    for (;;) {
      items.push(parseValue())
      ws()
      if (text[i] === ',') {
        i++
        continue
      }
      if (text[i] === ']') {
        i++
        return items
      }
      fail('« , » ou « ] » attendu')
    }
  }

  const value = parseValue()
  ws()
  if (i !== text.length) fail('contenu après la fin du document')
  return { value, duplicates }
}

/* ------------------------------------------------------------------ */
/* Utilitaires sur les chemins de clés (« pricing.rows.nounou-1 »)      */
/* ------------------------------------------------------------------ */

function leaves(node, path = '', into = new Map()) {
  if (Array.isArray(node)) {
    node.forEach((item, index) => leaves(item, `${path}.${index}`, into))
    return into
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) leaves(value, path ? `${path}.${key}` : key, into)
    return into
  }
  into.set(path, typeof node)
  return into
}

function get(obj, path) {
  return path.split('.').reduce((acc, part) => (acc == null ? acc : Array.isArray(acc) ? acc[Number(part)] : acc[part]), obj)
}

const walk = (dir, filter) => {
  const found = []
  for (const name of readdirSync(join(root, dir))) {
    const path = join(dir, name)
    if (statSync(join(root, path)).isDirectory()) found.push(...walk(path, filter))
    else if (filter(path)) found.push(path)
  }
  return found
}

const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '')

/* ------------------------------------------------------------------ */

const dictionaries = {}
const structures = {}
const duplicateProblems = []
for (const locale of LOCALES) {
  const { value, duplicates } = parseJsonCheckingDuplicates(read(`dictionaries/${locale}.json`), `${locale}.json`)
  dictionaries[locale] = value
  structures[locale] = leaves(value)
  duplicateProblems.push(...duplicates)
}

// 1) parité de structure
const reference = structures.fr
const mismatches = []
for (const locale of LOCALES.filter((l) => l !== 'fr')) {
  for (const [path, type] of reference) {
    const other = structures[locale].get(path)
    if (other === undefined) mismatches.push(`${locale}: clé manquante « ${path} »`)
    else if (other !== type) mismatches.push(`${locale}: « ${path} » est ${other}, attendu ${type}`)
  }
  for (const path of structures[locale].keys()) if (!reference.has(path)) mismatches.push(`${locale}: clé inconnue « ${path} » (absente de fr.json)`)
}
check(`les trois dictionnaires ont la même structure (${reference.size} feuilles par langue)`, mismatches.length === 0, mismatches.slice(0, 12).join('\n    '))

// 2) doublons de clés
check('aucun doublon de clé dans les dictionnaires JSON', duplicateProblems.length === 0, duplicateProblems.slice(0, 8).join('\n    '))

// 3) parité des modèles {marque}
const MARKER = /\{(\w+)\}/g
const templateProblems = []
for (const [path, type] of reference) {
  if (type !== 'string') continue
  const expected = [...String(get(dictionaries.fr, path)).matchAll(MARKER)].map((m) => m[1]).sort()
  if (!expected.length) continue
  for (const locale of LOCALES) {
    const found = [...String(get(dictionaries[locale], path)).matchAll(MARKER)].map((m) => m[1]).sort()
    if (JSON.stringify(found) !== JSON.stringify(expected)) templateProblems.push(`${path} — ${locale}: {${found.join(',')}} alors que fr a {${expected.join(',')}}`)
  }
}
check('les modèles {marque} sont identiques dans les trois langues', templateProblems.length === 0, templateProblems.slice(0, 10).join('\n    '))

// 4) métadonnées de langue, cohérentes entre dictionnaires et configuration
const config = read('lib/i18n/config.ts')
const metaProblems = []
for (const locale of LOCALES) {
  const meta = dictionaries[locale].meta
  const expected = EXPECTED[locale]
  if (meta.locale !== locale) metaProblems.push(`${locale}: meta.locale = ${meta.locale}`)
  if (meta.dir !== expected.dir) metaProblems.push(`${locale}: meta.dir devrait être « ${expected.dir} »`)
  if (meta.languageCode !== expected.htmlLang) metaProblems.push(`${locale}: meta.languageCode devrait être « ${expected.htmlLang} »`)
  for (const token of [expected.htmlLang, expected.hreflang, expected.ogLocale, expected.dir, expected.short]) {
    if (!config.includes(token)) metaProblems.push(`${locale}: « ${token} » absent de lib/i18n/config.ts`)
  }
}
check('métadonnées de langue conformes (arabe = rtl, hreflang fr-MA/ar-MA/en-MA)', metaProblems.length === 0, metaProblems.join('\n    '))

// 5) contenu exigé par la spécification
const spec = [
  ['hero.tagline', { fr: 'Le bon profil, au bon endroit.', ar: 'البروفيل المناسب، فالمكان المناسب.', en: 'The right profile, in the right place.' }],
  ['b2c.services.menage.title', { fr: 'Ménage à domicile', ar: 'المعاونة فالدار', en: 'Home cleaning' }],
  ['b2c.services.garde-enfants.title', { fr: 'Garde d’enfants (nounous)', ar: 'تربية الأطفال (الرباطة)', en: 'Childcare & Nannies' }],
  ['b2c.services.personnes-agees.title', { fr: 'Aide aux personnes âgées', ar: 'المساعدة لكبار السن', en: 'Elderly assistance' }],
  ['common.chatCta', { fr: 'Discuter sur WhatsApp', ar: 'تواصل معنا على واتساب', en: 'Chat on WhatsApp' }],
]
const contentProblems = []
for (const [path, expected] of spec) {
  for (const [locale, value] of Object.entries(expected)) {
    const found = get(dictionaries[locale], path)
    if (found !== value) contentProblems.push(`${locale} — ${path}\n      attendu : ${value}\n      trouvé  : ${found}`)
  }
}
check('textes de la spécification présents dans les dictionnaires (devise, services B2C, CTA WhatsApp)', contentProblems.length === 0, contentProblems.join('\n    '))

// chaque dictionnaire doit écrire dans son propre système de notation
const scriptProblems = LOCALES.flatMap((locale) => {
  const out = []
  for (const [path, type] of structures[locale]) {
    if (type !== 'string') continue
    const value = String(get(dictionaries[locale], path))
    const arabic = /[\u0600-\u06FF]/.test(value)
    if (locale === 'en' && arabic) out.push(`en — ${path} : contient des caractères arabes`)
    if (locale === 'fr' && arabic) out.push(`fr — ${path} : contient des caractères arabes`)
    if (locale === 'ar' && !arabic && (value.match(/[A-Za-zÀ-ÿ]{4,}/g) ?? []).length > 2) {
      out.push(`ar — ${path} : phrases non traduites ? (${value.match(/[A-Za-zÀ-ÿ]{4,}/g).slice(0, 4).join(', ')})`)
    }
  }
  return out
})
check('chaque dictionnaire écrit dans son propre système (arabe en arabe, anglais en latin)', scriptProblems.length === 0, scriptProblems.slice(0, 8).join('\n    '))

// 6) classes directionnelles figées dans la vitrine
const FIXED_DIRECTION =
  /(?:^|[\s"'`])(?:[a-z0-9-]+:)*(?:ml|mr|pl|pr)-[0-9.].*|(?:^|[\s"'`])(?:[a-z0-9-]+:)*text-(?:left|right)(?=[\s"'`])|(?:^|[\s"'`])(?:[a-z0-9-]+:)*(?:left|right)-[0-9.].*|(?:^|[\s"'`])(?:[a-z0-9-]+:)*border-[lr]-(?:[0-9]|\[)|(?:^|[\s"'`])(?:[a-z0-9-]+:)*rounded-(?:t|b)[lr]-/
const siteFiles = [...walk('components/site', (p) => /\.tsx$/.test(p)), 'app/globals.css', 'app/page.tsx', 'app/not-found.tsx']
const directionProblems = []
for (const file of siteFiles) {
  const code = stripComments(read(file))
  code.split('\n').forEach((line, index) => {
    if (FIXED_DIRECTION.test(line)) directionProblems.push(`${file}:${index + 1}: ${line.trim().slice(0, 110)}`)
  })
}
check('vitrine sans utilitaires directionnels figés (ms/me/ps/pe, text-start/end, border-s, rounded-ss/es, inset-inline-*)', directionProblems.length === 0, directionProblems.slice(0, 12).join('\n    '))

// les icônes directionnelles doivent être retournées explicitement (le CSS logique ne suffit pas)
const react = read('lib/i18n/react.tsx')
check('icônes directionnelles retournées en rtl (RtlArrow) et valeurs latines isolées (LtrValue)', /scaleX\(-1\)/.test(react) && /dir="ltr"/.test(react))

// 7) câblage
const layout = read('app/layout.tsx')
check('layout racine : <html> rendu avec lang ET dir issus de la langue résolue', /const \{ htmlLang: lang, dir \} = LOCALES_META\[locale\]/.test(layout) && /<html lang=\{lang\} dir=\{dir\}>/.test(layout))
check('layout racine : une seule source de vérité (cookie lu via resolveRequestLocale, repli rememberLocale)', /resolveRequestLocale\(\)/.test(layout) && /rememberLocale\(locale\)/.test(layout))
check('layout racine : hreflang rendus dans le <head> (fr-MA/ar-MA/en-MA + x-default)', /rel="alternate"/.test(layout) && /x-default/.test(layout))
const proxyFile = read('proxy.ts')
check("proxy : ?lang=… normalisé en cookie puis adresse canonique (layout et page d'accord)", /LOCALE_QUERY_PARAM/.test(proxyFile) && /NextResponse\.redirect/.test(proxyFile) && /applyLocaleCookie/.test(proxyFile))
check('proxy : export `proxy` (convention Next 16) et matcher sans groupe capturant', /export function proxy\(/.test(proxyFile) && /\(\?!api\|_next\|videos/.test(proxyFile) && !/\/:path\*/.test(proxyFile) && /\(\?:/.test(proxyFile))
check('layout racine dynamique (une préférence de langue ne se met pas en cache pour tout le monde)', /export const dynamic = 'force-dynamic'/.test(layout))
const header = read('components/site/SiteHeader.tsx')
check('en-tête : le sélecteur de langue est monté', /<LanguageSwitcher/.test(header))
const switcher = read('components/site/LanguageSwitcher.tsx')
check('sélecteur : boutons accessibles (aria-pressed) pilotés par useLocaleActions', /aria-pressed=\{selected\}/.test(switcher) && /useLocaleActions/.test(switcher))
const clientProvider = read('lib/i18n/client.tsx')
check('persistance cookie + localStorage, puis re-rendu serveur', /writeLocaleCookie/.test(clientProvider) && /writeStoredLocale/.test(clientProvider) && /router\.refresh\(\)/.test(clientProvider))
// Le module partagé est lu par les Composants Serveur : y glisser une API client fait échouer le build.
const shared = stripComments(read('lib/i18n/dictionaries.ts')) + stripComments(read('lib/i18n/props.ts'))
const clientOnly = ['useTransition', 'useEffect', 'useState', 'next/navigation', 'useRouter']
const leaks = clientOnly.filter((api) => shared.includes(api))
check('module i18n partagé (serveur + client) sans API réservée au client', leaks.length === 0, `APIs clientes importées : ${leaks.join(', ')}`)
check('le fournisseur de bascule est monté dans le layout racine', /<LocaleProvider locale=\{locale\}>/.test(read('app/layout.tsx')))
// L'architecture retenue : le dictionnaire est passé en prop aux sections (aucun contexte serveur→client).
const propsContract = read('lib/i18n/props.ts')
check('contrat `Localized` (dict + locale) défini et consommé par les sections', /export type Localized/.test(propsContract) && (walk('components/site', (p) => /\.tsx$/.test(p)).filter((file) => read(file).includes('Localized')).length >= 10), `${walk('components/site', (p) => /\.tsx$/.test(p)).filter((file) => read(file).includes('Localized')).length} composants`)
check('cookie et clé de stockage nommés, durée d’un an', /LOCALE_COOKIE = 'yallah_locale'/.test(config) && /LOCALE_STORAGE_KEY = 'yallah\.locale'/.test(config) && /LOCALE_COOKIE_MAX_AGE = 60 \* 60 \* 24 \* 365/.test(config))
const server = read('lib/i18n/server.ts')
const resolver = (/function resolveLocale\([\s\S]*?\n}/.exec(stripComments(server)) ?? [''])[0]
check('résolution serveur : URL › cookie › Accept-Language › français', ['input.lang', 'input.cookie', 'fromAcceptLanguage', 'DEFAULT_LOCALE'].every((token, index, tokens) => index === 0 || resolver.indexOf(tokens[index - 1]) < resolver.indexOf(token)), resolver || 'fonction resolveLocale introuvable')
const waLink = read('components/site/WhatsAppLink.tsx')
check('WhatsApp : le message pré-rempli vient du dictionnaire (clé `wa`), plus de chaîne figée', /waMessage\(dict, messageKey/.test(waLink) && !/WA\.general/.test(waLink))
check('WhatsApp : le libellé du bouton est traduit lui aussi (aria-label suffixé)', /onWhatsAppSuffix/.test(waLink))
const sitemap = read('app/sitemap.xml/route.ts')
check('sitemap : hreflang fr-MA/ar-MA/en-MA + x-default déclarés', /hreflang=/.test(sitemap) && /x-default/.test(sitemap) && /xmlns:xhtml/.test(sitemap))
check('sitemap : trois adresses déclarées (une par langue)', ['localeUrl(base, locale)', 'homeEntries', 'HOME'].every((token) => sitemap.includes(token)))
check('aucune chaîne lisible codée en dur dans la vitrine', (() => {
  const suspicious = []
  for (const file of walk('components/site', (p) => /\.tsx$/.test(p))) {
    const code = stripComments(read(file))
    for (const match of code.matchAll(/>([^<>{}]{20,})</g)) {
      const text = match[1].trim()
      if (/[a-zàâçéèêëîïôûùüÿœæ]{3,}\s+(?:de|du|des|à|au|aux|pour|avec|sur|les|vous|nous)\s+/i.test(text)) {
        suspicious.push(`${file}: ${text.slice(0, 70)}`)
      }
    }
  }
  if (suspicious.length) console.log(`    textes en dur détectés :\n      ${suspicious.slice(0, 8).join('\n      ')}`)
  return suspicious.length === 0
})())

console.log(failures === 0 ? '\nAudit i18n : tout est conforme.' : `\nAudit i18n : ${failures} point(s) à corriger.`)
process.exit(failures === 0 ? 0 : 1)
