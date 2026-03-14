# COZY SPACE.DZ — storefront rebrand template

Base Astro + Tailwind pour une boutique vitrine catalogue legere, rebrandee pour **COZY SPACE.DZ**.

## Stack

- Astro
- Tailwind CSS
- TypeScript
- Contenu centralise dans `src/data`
- Cible de deploiement: Cloudflare Pages

## Installation locale

```bash
npm install
npm run dev
```

Le site sera disponible en local via le serveur Astro.

## Build production

```bash
npm run build
```

Le dossier de sortie genere par Astro peut ensuite etre deploye sur Cloudflare Pages.

## Deploiement Cloudflare Pages

### Option 1 — via Git

1. Pousser le projet sur un depot Git.
2. Creer un nouveau projet Cloudflare Pages.
3. Connecter le depot.
4. Renseigner ces commandes:
   - Build command: `npm run build`
   - Output directory: `dist`
5. Lancer le deploiement.

### Option 2 — via upload direct

1. Executer `npm run build`.
2. Envoyer le dossier `dist` sur Cloudflare Pages si vous utilisez un flux de publication statique.

## Structure cle

- `public/images/brand`: logo et banniere fournis
- `public/images/products`: visuels demo produits
- `public/images/categories`: visuels demo categories
- `src/data/site.ts`: nom de marque, tagline, CTA, reseaux, trust items, textes de marque
- `src/data/categories.ts`: categories demo
- `src/data/products.ts`: produits demo et featured products
- `src/data/faq.ts`: FAQ courte
- `src/components`: composants reutilisables
- `src/pages`: pages du site

## Champs a personnaliser plus tard

### Priorite 1

- `src/data/site.ts`
  - `brandName`
  - `tagline`
  - `description`
  - `primaryCTA`
  - `secondaryCTA`
  - `socialLinks`
  - `trustItems`
  - `aboutCopy`

### Priorite 2

- `src/data/categories.ts`
  - noms de categories
  - descriptions
  - images de categories

- `src/data/products.ts`
  - titres produits
  - prix
  - anciennes promotions
  - images
  - descriptions courtes
  - points forts
  - disponibilite
  - tags

### Priorite 3

- `public/images/brand/logo-cozy-space.jpg`
- `public/images/brand/banner-cozy-space.jpg`
- toutes les images demo dans `public/images/products`
- toutes les images demo dans `public/images/categories`

## Notes de contenu

- Le projet n affiche pas de faux numero ni de faux email, pour rester coherent avec les informations actuellement disponibles.
- Les reseaux sociaux connus sont integres dans le header, le hero, la page contact et le footer.
- Les produits et categories sont des donnees demo propres, faciles a remplacer.
- Le template ne contient pas de panier, checkout, wishlist ou logique e-commerce lourde.

## Pages incluses

- `/`
- `/catalogue`
- `/produit/[slug]`
- `/a-propos`
- `/contact`

## Assets utilises

- Le logo fourni a ete integre dans `public/images/brand/logo-cozy-space.jpg`.
- La banniere fournie a ete integree dans `public/images/brand/banner-cozy-space.jpg`.

## Remarque

Cette base est volontairement sobre, legere et facilement editable. Une fois les vraies donnees metier disponibles, le rebranding final et l enrichissement produit peuvent se faire rapidement sans changer l architecture.
