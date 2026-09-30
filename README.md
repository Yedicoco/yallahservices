# Yallah Services

Vitrine commerciale de **Yallah Services** (« Le bon profil, au bon endroit. ») : mise en relation de personnel qualifié pour les particuliers (B2C) et les entreprises (B2B) au Maroc. Site Next.js (App Router) déployé sur Vercel : <https://yallahservices.vercel.app>.

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_l3xX092c3qx9PtGHM2EsxVPyjynE)

## Ce que fait le site

- **Vitrine publique** (`/`) : navigation fixe *Accueil → Services Particuliers → Services Entreprises → Tarifs & Grille → Zones d'intervention → Vidéos → Contact*, offre B2C et offre B2B visuellement séparées, grille tarifaire en tableau HTML indexable, zones et quartiers, vidéos, contact. Des boutons **WhatsApp** avec message pré-rempli sont présents partout — **dans la langue choisie**.
- **Multi-langue** : français (par défaut), anglais, et darija marocaine en écriture arabe avec mise en page RTL complète. Voir [Langues](#langues-fr--ar--en).
- **Produit 1 : Login Kit TikTok public** : un visiteur peut (facultativement) se connecter avec TikTok dans le formulaire de contact ; le site lit son nom de profil public pour personnaliser le message WhatsApp. Scope demandé : `user.info.basic` **uniquement**.
- **Produit 2 : Direct Post TikTok interne** : publication de vidéos sur `@yallah.services.m` depuis un espace réservé (`/connect`), invisible du public. Scopes : `user.info.basic` + `video.publish`.

Les deux produits sont **strictement séparés** (routes, cookies, scopes, configuration) : aucun n'écrase l'autre.

## Architecture des routes TikTok

```
app/api/tiktok/
├── auth/                       PRODUIT 1 — Login Kit public (leads)
│   ├── route.ts                GET  démarre la connexion (scope user.info.basic)
│   ├── callback/route.ts       GET  retour TikTok → session visiteur (nom + avatar)
│   ├── status/route.ts         GET  { connected, profile }
│   └── logout/route.ts         POST efface la session visiteur
└── admin/                      PRODUIT 2 — Direct Post interne (404 pour tout non-administrateur)
    ├── session/route.ts        GET  ouverture de session (clé) · DELETE fermeture
    ├── connect/route.ts        GET  démarre la connexion du compte · DELETE déconnecte et révoque
    ├── callback/route.ts       GET  retour TikTok → jetons chiffrés, stockés côté serveur
    ├── creator-info/route.ts   GET  état de la connexion + réglages du créateur
    └── publish/route.ts        POST publie · GET ?publish_id= suit la publication
app/connect/page.tsx            interface de publication (404 sans session admin)
```

| | Login Kit public | Direct Post interne |
|---|---|---|
| Qui se connecte | n'importe quel visiteur, avec son compte | l'équipe, avec `@yallah.services.m` |
| Scopes | `user.info.basic` | `user.info.basic` + `video.publish` |
| Jeton TikTok | **jamais conservé** (lu une fois, puis révoqué) | chiffré (AES-256-GCM) dans Upstash Redis, **rafraîchi automatiquement** |
| Ce qui reste côté visiteur | cookie chiffré : nom + avatar, 12 h | rien (session admin : cookie chiffré, 8 h) |
| URI de retour | `/api/tiktok/auth/callback` | `/api/tiktok/admin/callback` |
| Cookie d'état OAuth | `yallah_tt_login_state` | `yallah_tt_admin_state` |

Anciennes adresses conservées (réécritures dans `next.config.mjs`, pour ne rien casser côté portail TikTok) : `/api/auth/tiktok` → `/api/tiktok/auth`, `/api/auth/callback` et `/api/tiktok/callback` → `/api/tiktok/auth/callback`. Elles pointent vers le produit **public**.

## Mise en route sur Vercel

1. **Stockage durable des jetons.** Sur Vercel, le disque est éphémère : un fichier local (du type `.data/users.json`) disparaît à chaque déploiement, et un cookie n'est pas un stockage serveur. Dans le projet Vercel : *Storage → Marketplace → **Upstash Redis** → Connect Project*. Les variables `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (ou les anciens noms `KV_REST_API_*`) sont injectées automatiquement. Aucune dépendance npm n'est ajoutée : l'adaptateur (`lib/storage/kv.ts`) parle directement à l'API REST d'Upstash.
2. **Variables d'environnement** (*Settings → Environment Variables*, environnement Production) : voir le tableau ci-dessous et `.env.example`. Générez les secrets avec `openssl rand -hex 32`.
3. **TikTok for Developers** :
   - *Login Kit → Redirect URI* : déclarez `https://yallahservices.vercel.app/api/tiktok/auth/callback` **et** `https://yallahservices.vercel.app/api/tiktok/admin/callback`. Gardez l'ancienne URI déjà déclarée si `TIKTOK_REDIRECT_URI` la contient encore.
   - *Content Posting API* : activez **Direct Post** (`video.publish`) pour l'application.
   - *Manage apps → URL properties* : le domaine `https://yallahservices.vercel.app/` doit être vérifié (les fichiers `public/tiktok*.txt` servent à cette vérification). TikTok n'accepte la publication depuis une URL que pour un domaine vérifié.
   - Tant que l'application n'a pas passé l'audit TikTok, **toute publication est limitée à la visibilité « Moi uniquement »**. Ajoutez votre compte comme *target user* (sandbox) pour tester.
4. **Déployer**, puis ouvrir `https://yallahservices.vercel.app/connect?key=<ADMIN_SECRET>`, cliquer *Connecter le compte TikTok* et autoriser.

### Variables d'environnement

| Variable | Rôle | Obligatoire |
|---|---|---|
| `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` | identifiants de l'application TikTok | oui |
| `TIKTOK_REDIRECT_URI` | URI de retour du Login Kit public | oui |
| `SESSION_SECRET` | chiffre la session visiteur et les jetons stockés (≥ 32 caractères) | oui en production |
| `ADMIN_SECRET` | ouvre l'espace interne (≥ 24 caractères) ; absent = espace interne désactivé | pour le Direct Post |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | stockage durable des jetons admin | pour le Direct Post |
| `TIKTOK_ADMIN_CLIENT_KEY`, `TIKTOK_ADMIN_CLIENT_SECRET`, `TIKTOK_ADMIN_REDIRECT_URI` | application TikTok distincte pour le Direct Post | non (par défaut : mêmes identifiants, URI `/api/tiktok/admin/callback`) |
| `TIKTOK_VIDEO_ALLOWED_HOSTS` | hôtes vérifiés supplémentaires pour la publication depuis une URL | non |
| `NEXT_PUBLIC_SITE_URL` | adresse publique (canonique, partages, publication) | non (défaut : domaine Vercel de production) |

Les clés `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` et `TIKTOK_REDIRECT_URI` sont conservées telles quelles. Les clés et jetons ne doivent jamais être commités.

## Sécurité de l'espace interne

- **Invisible** : sans session administrateur, `/connect` et toutes les routes `/api/tiktok/admin/*` répondent par le même 404 que n'importe quelle adresse inconnue. Aucun lien public, ni dans `robots.txt` ni dans `sitemap.xml`.
- **Accès** : `/connect?key=<ADMIN_SECRET>` (clé vérifiée en temps constant). La clé est échangée contre un cookie chiffré `HttpOnly`/`Secure`/`SameSite=Lax` de 8 h, puis retirée de l'URL. Changer `ADMIN_SECRET` invalide immédiatement toutes les sessions. Un court délai freine les essais répétés.
- **Jetons** : chiffrés (AES-256-GCM, clé dérivée par HKDF) avant d'être écrits dans Redis ; jamais dans un cookie, jamais dans les journaux. Rafraîchis avant expiration (le nouveau `refresh_token` renvoyé par TikTok remplace toujours l'ancien).
- **Anti-CSRF** : cookie `SameSite=Lax` + contrôle de l'en-tête `Origin` sur toute requête d'écriture.
- **Règles éditoriales appliquées côté serveur** à chaque publication (l'interface ne suffit jamais) : appel à l'action WhatsApp obligatoire, aucun tarif ferme, aucune coordonnée tierce, confirmation explicite de l'administrateur, vidéo hébergée sur un domaine vérifié, visibilité choisie parmi celles que TikTok renvoie (aucune valeur par défaut), interactions désactivées par défaut.

## Contenu vidéo (production soutenable)

Deux rubriques prioritaires, répétables dans la durée :

1. **Le bon profil du jour** : un besoin par ville ou quartier (« Aujourd'hui, une aide-ménagère disponible à Aïn Diab »), sans jamais nommer de personne.
2. **Coulisses & Vos Questions** : le processus de mise en relation et les réponses aux questions reçues sur WhatsApp (anonymisées).

Le volet Entreprises a sa propre vidéo, dans la section Entreprises (jamais mélangé au contenu B2C). Constantes non négociables, rappelées publiquement et contrôlées par le serveur : **CTA WhatsApp systématique, aucun tarif ferme, aucune donnée identifiante** de client ou de candidat.

Le catalogue (`lib/videos.ts`) est la source unique de la vitrine et du formulaire de publication. Pour ajouter une vidéo : déposez le fichier dans `public/videos/` en **kebab-case strict** (minuscules, chiffres et tirets : pas d'espace, d'accent ni d'apostrophe), ajoutez une image de couverture `public/images/video-posters/<id>.jpg`, puis déclarez-la dans `lib/videos.ts`.

## Langues (FR · AR · EN)

Trois langues, un seul chemin d'URL (`/`) : la langue est une **préférence**, pas une arborescence.

| Langue | Code | Sens | Locale HTML | hreflang |
| --- | --- | --- | --- | --- |
| Français (défaut) | `fr` | LTR | `fr-MA` | `fr-MA` |
| Darija marocaine | `ar` | **RTL** | `ar-MA` | `ar-MA` |
| English | `en` | LTR | `en-MA` | `en-MA` |

### Comment ça marche

1. **Résolution** — dans `proxy.ts`, la langue demandée est normalisée **avant** le rendu, dans cet ordre :
   `?lang=xx` (lien partageable, converti en cookie puis adresse canonique sans paramètre) → cookie
   `yallah_locale` → en-tête `Accept-Language` → `fr`. Layout, page et métadonnées relisent tous le
   **même cookie** : `<html lang dir>` et le contenu ne peuvent donc pas diverger.
2. **Textes** — trois dictionnaires JSON (`dictionaries/fr.json`, `ar.json`, `en.json`), typés par
   `lib/i18n/schema.ts`. `fr.json` est la **référence** : les deux autres doivent avoir exactement le
   même arbre de clés (contrôlé). Les chaînes sont servies **côté serveur** et passées en prop
   (`{ dict, locale }`, type `Localized`) à chaque section ; aucun dictionnaire n'est embarqué dans le
   bundle client.
3. **Bascule** — trois pastilles `FR | AR | EN` dans l'en-tête (`components/site/LanguageSwitcher.tsx`) :
   elles écrivent le cookie **et** `localStorage`, puis redemandent un rendu serveur. Le choix survit
   donc au rechargement, même 6 mois plus tard, et fonctionne aussi bien sans JavaScript (liens + cookie).
4. **RTL** — uniquement des **utilitaires logiques** Tailwind (`ms-*`, `me-*`, `ps-*`, `pe-*`,
   `text-start`/`text-end`, `border-s-*`, `rounded-ss-*`, `inset-inline-*`) : le mise en page se retourne
   sans `dir`-specific classes. Les icônes directionnelles sont retournées (`RtlArrow`), les valeurs
   latines (téléphone, e-mail, durées, prix) sont isolées en `dir="ltr"` (`LtrValue`) pour que le
   bidi ne les casse pas, et la typographie arabe (interlignage, graisses, italique neutralisé, pile de
   polices) est portée par `html[lang^='ar']` dans `app/globals.css`.
5. **SEO** — titre, description, `og:locale` et canonique par langue ; liens `hreflang` (`fr-MA`,
   `ar-MA`, `en-MA`, `x-default`) dans le `<head>` **et** dans `app/sitemap.xml/route.ts` (trois adresses
   qui se déclarent mutuellement). Les pages légales, publiées en français, restent hors du système.

### Où ajouter un texte

- Nouvelle chaîne → `dictionaries/fr.json`, puis `ar.json` et `en.json` avec les **mêmes clés** ; si la
  forme change le type, ajoutez-la dans `lib/i18n/schema.ts`. Les jetons dynamiques s'écrivent
  `{ville}`, `{count}`, … et sont appliqués par `t()` ; les trois langues doivent employer les mêmes.
- Nouveau message WhatsApp → une clé dans `dict.wa.*`, et `waMessage(dict, 'cle', params)` ; ne jamais
  concaténer de texte traduit à la main.
- L'espace interne (`/connect`, API TikTok) reste **en français** : ce n'est pas une interface publique.

### Vérifier

```bash
pnpm check:i18n     # ~40 contrôles : parité des clés et des jetons, textes de la spécification,
                    # absence d'utilitaires directionnels figés, câblage layout/proxy/sitemap, etc.
```

## Vérifications

```bash
pnpm install            # ou npm install
pnpm typecheck          # tsc --noEmit (le build ignore les erreurs de types : ceci les révèle)
pnpm check              # audit statique : médias, noms de vidéos, liens, pages légales, routes TikTok
pnpm check:i18n         # audit des langues : parité des dictionnaires, RTL, hreflang, câblage
pnpm check:all          # les deux audits d'un coup
pnpm test:e2e           # build + une centaine de contrôles de bout en bout (faux TikTok + faux Upstash, aucun vrai secret)
```

`pnpm test:e2e` démarre ses propres faux services et n'utilise jamais vos identifiants : il vérifie la séparation public/interne, l'invisibilité de l'espace interne, le chiffrement des jetons, le rafraîchissement et la rotation du `refresh_token`, les règles éditoriales, **et le multi-langue en HTTP réel** (résolution `?lang=` → cookie, persistance, `lang`/`dir` cohérents avec le contenu, messages WhatsApp traduits, hreflang du sitemap).

## Pages légales

La politique de confidentialité et les conditions d'utilisation (exigence TikTok) restent servies par `public/privacy.html` et `public/terms.html`, aussi disponibles sur `/confidentialite` et `/cgu`, et reliées depuis le pied de page.

## Développement local

```bash
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000). Copiez `.env.example` vers `.env.local` pour tester TikTok. Sans Upstash configuré, un stockage **mémoire** est utilisé en développement uniquement (les jetons sont perdus au redémarrage) ; en production, l'absence de stockage est une erreur explicite.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
