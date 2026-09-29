# Intégration TikTok Direct Post — installation

## 1. Copier les fichiers
Copie l'arborescence telle quelle dans ton repo Next.js (App Router) :
```
lib/tiktok.ts
app/api/tiktok/connect/route.ts
app/api/tiktok/callback/route.ts
app/api/tiktok/creator-info/route.ts
app/api/tiktok/publish/route.ts
app/connect/page.tsx
```

## 2. Variables d'environnement (Vercel → Project Settings → Environment Variables)
```
TIKTOK_CLIENT_KEY=<depuis le portail TikTok Developers>
TIKTOK_CLIENT_SECRET=<depuis le portail TikTok Developers — jamais dans le code>
TIKTOK_REDIRECT_URI=https://yallahservices.vercel.app/api/tiktok/callback
```
Cette valeur doit être **caractère pour caractère identique** à celle déclarée dans
le champ Redirect URI du portail TikTok (schéma, domaine, chemin, absence de slash final).

## 3. Déclarer le Redirect URI côté TikTok
Dans le produit Login Kit de l'App, ajoute exactement :
`https://yallahservices.vercel.app/api/tiktok/callback`

## 4. Désactiver la protection Vercel
Deployment Protection doit être désactivée (ou un domaine personnalisé attaché) :
sinon TikTok — et tes propres tests — tombent sur l'écran de login Vercel au lieu du site.

## 5. Contrainte PULL_FROM_URL
TikTok exige que la vidéo à publier soit hébergée sous un domaine/préfixe **déjà vérifié**
côté TikTok (le même que celui utilisé pour Privacy Policy / Terms of Service). Concrètement :
héberge les vidéos sous `https://yallahservices.vercel.app/videos/...`
(dossier `public/videos/` pour un test rapide, ou Vercel Blob Storage pour du contenu géré
dynamiquement). Une vidéo hébergée ailleurs (YouTube, Google Drive, etc.) déclenchera
l'erreur `url_ownership_unverified`.

## 6. Test en sandbox
Tant que l'App n'est pas passée en review, ajoute ton compte TikTok comme *target user*
dans Roles & Access → Sandbox. C'est ce flux (connexion + publication) qu'il faut filmer
pour la vidéo de démo exigée par TikTok.

## 7. Limites du MVP
- Le token est stocké dans un cookie httpOnly, pas en base de données : il expire et n'est
  pas rafraîchi automatiquement. Pour un usage en production au-delà du test, ajoute un
  stockage serveur (DB) + un appel à l'endpoint refresh_token avant expiration.
- Tant que l'audit TikTok n'est pas passé, toute publication est forcée en visibilité
  privée (`SELF_ONLY`), quelle que soit l'option choisie dans l'interface.
