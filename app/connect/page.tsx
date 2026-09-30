import { notFound, redirect } from 'next/navigation'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { isAdminSession, verifyAdminKey } from '@/lib/security/admin'
import { siteUrl } from '@/lib/site'
import { VIDEOS } from '@/lib/videos'

/**
 * PRODUIT 2 — Espace interne Direct Post (publication sur @yallah.services.m).
 *
 * Point d'entrée invisible : sans session administrateur valide, cette page répond par le même 404
 * que n'importe quelle adresse inconnue. Aucun lien public n'y mène (navigation, pied de page,
 * sitemap, robots.txt).
 *
 * Accès : /connect?key=<ADMIN_SECRET>. La clé est vérifiée ici, en temps constant ; si elle est bonne,
 * la route /api/tiktok/admin/session pose le cookie de session puis renvoie vers /connect sans la clé.
 * Une clé fausse et une absence de clé passent par le même code et donnent exactement la même réponse
 * (404, même page), après un court délai qui freine les essais répétés.
 *
 * Aucune `metadata` n'est exportée ici : le titre et le « noindex » de l'espace interne sont posés par
 * AdminPanel, donc uniquement une fois authentifié. Sinon le titre fuirait dans le HTML du 404.
 */
export const dynamic = 'force-dynamic'

export default async function ConnectPage({ searchParams }: { searchParams: Promise<{ key?: string | string[] }> }) {
  const { key } = await searchParams

  if (typeof key === 'string' && verifyAdminKey(key)) {
    redirect(`/api/tiktok/admin/session?key=${encodeURIComponent(key)}`)
  }

  if (!(await isAdminSession())) {
    if (key !== undefined) await new Promise((resolve) => setTimeout(resolve, 700))
    notFound()
  }

  return <AdminPanel videos={VIDEOS} origin={siteUrl()} />
}
