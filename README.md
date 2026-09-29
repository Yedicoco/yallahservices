# yallahservices

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_l3xX092c3qx9PtGHM2EsxVPyjynE)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## TikTok Content Posting API

Le dépôt contient maintenant les pages publiques nécessaires à la revue TikTok :

- `https://yallahservices.vercel.app/confidentialite`
- `https://yallahservices.vercel.app/cgu`

Le flux serveur Direct Post est disponible via `/api/auth/tiktok` et `/api/auth/callback` (les anciens chemins `/api/tiktok/auth` et `/api/tiktok/callback` restent compatibles), ainsi que `/api/tiktok/publish` et `/api/tiktok/status`. Il ne publie qu’après une autorisation TikTok valide et un consentement explicite transmis à l’endpoint de publication.

### Variables Vercel à configurer

Créer ces variables côté serveur, dans les environnements Preview et Production si nécessaire :

```text
TIKTOK_CLIENT_KEY=<Client Key de l’application TikTok>
TIKTOK_CLIENT_SECRET=<Client Secret de l’application TikTok>
TIKTOK_REDIRECT_URI=https://yallahservices.vercel.app/api/auth/callback
SESSION_SECRET=<secret aléatoire d’au moins 32 caractères>
```

Dans TikTok for Developers, enregistrer exactement cette Redirect URI HTTPS et activer Content Posting API + Direct Post avec le scope `video.publish`. TikTok indique qu’un client non audité est limité aux publications privées jusqu’à la fin de l’audit. Pour `PULL_FROM_URL`, le domaine qui héberge la vidéo doit aussi être vérifié auprès de TikTok.

La publication attend un JSON de ce type sur `/api/tiktok/publish` :

```json
{
  "video_url": "https://domaine-verifie.example/video.mp4",
  "title": "Votre légende TikTok",
  "privacy_level": "SELF_ONLY",
  "consent": true,
  "is_aigc": false
}
```

La valeur `privacy_level` doit être choisie parmi les options renvoyées par TikTok pour le compte connecté. Les clés et jetons ne doivent jamais être commités dans Git.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
