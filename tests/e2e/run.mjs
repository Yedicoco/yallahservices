// Orchestrateur des tests de bout en bout (npm run test:e2e).
// Démarre le faux TikTok et le faux Upstash, lance le site en mode PRODUCTION avec un environnement de test
// (la commande npm construit le site juste avant), exécute checks.mjs, puis arrête tout.
// Les variables d'environnement réelles (TikTok, Upstash, secrets) sont volontairement écrasées : ce test
// n'utilise jamais vos identifiants et ne contacte jamais TikTok.
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { startMocks } from './mock-servers.mjs'

const PORTS = { app: 3199, tiktok: 4310, upstash: 4311 }
const ADMIN_SECRET = 'test-admin-secret-0123456789abcdef'

const appEnv = { ...process.env }
for (const name of ['TIKTOK_ADMIN_CLIENT_KEY', 'TIKTOK_ADMIN_CLIENT_SECRET', 'TIKTOK_ADMIN_REDIRECT_URI', 'TIKTOK_VIDEO_ALLOWED_HOSTS', 'KV_REST_API_URL', 'KV_REST_API_TOKEN', 'SITE_URL', 'VERCEL_PROJECT_PRODUCTION_URL']) {
  delete appEnv[name]
}
Object.assign(appEnv, {
  NEXT_TELEMETRY_DISABLED: '1',
  TIKTOK_API_BASE_URL: `http://127.0.0.1:${PORTS.tiktok}`,
  TIKTOK_CLIENT_KEY: 'ck_test',
  TIKTOK_CLIENT_SECRET: 'cs_test',
  TIKTOK_REDIRECT_URI: 'https://yallahservices.vercel.app/api/tiktok/auth/callback',
  SESSION_SECRET: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  ADMIN_SECRET,
  UPSTASH_REDIS_REST_URL: `http://127.0.0.1:${PORTS.upstash}`,
  UPSTASH_REDIS_REST_TOKEN: 'mocktoken',
  NEXT_PUBLIC_SITE_URL: 'https://yallahservices.vercel.app',
})

const nextBin = createRequire(import.meta.url).resolve('next/dist/bin/next')
const mocks = startMocks({ tiktokPort: PORTS.tiktok, upstashPort: PORTS.upstash })
const app = spawn(process.execPath, [nextBin, 'start', '-p', String(PORTS.app)], { env: appEnv, stdio: ['ignore', 'pipe', 'pipe'] })
let appLog = ''
app.stdout.on('data', (chunk) => (appLog += chunk))
app.stderr.on('data', (chunk) => (appLog += chunk))

async function waitForApp() {
  for (let attempt = 0; attempt < 80; attempt++) {
    if (app.exitCode !== null) throw new Error(`Le site s'est arrêté au démarrage :\n${appLog}`)
    try {
      const response = await fetch(`http://127.0.0.1:${PORTS.app}/`)
      if (response.ok) return
    } catch {
      // pas encore prêt
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`Le site n'a pas démarré à temps :\n${appLog}`)
}

let code = 1
try {
  await waitForApp()
  code = await new Promise((resolve) => {
    const checks = spawn(process.execPath, [fileURLToPath(new URL('./checks.mjs', import.meta.url))], {
      stdio: 'inherit',
      env: {
        ...process.env,
        BASE: `http://127.0.0.1:${PORTS.app}`,
        MOCK: `http://127.0.0.1:${PORTS.tiktok}`,
        KV: `http://127.0.0.1:${PORTS.upstash}`,
        ADMIN_SECRET,
        PROD: '1',
      },
    })
    checks.on('exit', (status) => resolve(status ?? 1))
  })
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
} finally {
  app.kill()
  await mocks.close()
}
process.exit(code)
