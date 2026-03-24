# Configuration Google Sheets

## Principe

Le projet utilise maintenant un seul script Apps Script :

- `google-apps-script.js`

Ce script unique gere :

- `GET` : lecture des produits depuis l'onglet `Produits`
- `POST` : enregistrement des commandes dans l'onglet `Commandes`
- `onEdit / onChange` : relance Netlify via Build Hook si configure

## Structure du Google Sheets

Utilisez un seul spreadsheet avec deux onglets :

- `Commandes`
- `Produits`

## Script Properties a ajouter

Dans Apps Script > `Project Settings` > `Script properties`, ajoutez :

```text
SPREADSHEET_ID=VOTRE_SPREADSHEET_ID
NETLIFY_BUILD_HOOK_URL=VOTRE_URL_BUILD_HOOK_NETLIFY
```

`NETLIFY_BUILD_HOOK_URL` est optionnel.

## Deploiement Apps Script

1. Ouvrez Apps Script depuis votre spreadsheet.
2. Supprimez le code par defaut.
3. Collez le contenu de `google-apps-script.js`.
4. Deploy > New deployment > Web App
5. Parametres recommandes :
   - Execute as: `Me`
   - Who has access: `Anyone`

## URL du script

L'URL `/exec` obtenue sert pour :

- les produits
- les commandes

Dans le projet, vous pouvez utiliser la meme URL pour :

```env
GOOGLE_SCRIPT_URL=VOTRE_URL_EXEC
PUBLIC_GOOGLE_SCRIPT_URL=VOTRE_URL_EXEC
PRODUCTS_FEED_URL=VOTRE_URL_EXEC
```

## Onglet Produits

Colonnes conseillees :

```text
id	slug	name	nameAr	baseName	baseNameAr	color	colorAr	variantGroup	category	collection	collectionAr	price	oldPrice	quantity	image	shortDescription	shortDescriptionAr	features	featuresAr	reasons	reasonsAr	availability	availabilityAr	featured	published	tags
```

## Onglet Commandes

Colonnes conseillees :

```text
Timestamp	Prenom	Nom	Telephone	Produit	Couleur	Quantite	Slug Produit	Prix	Adresse
```

## Notes importantes

- `id` doit etre unique
- `slug` doit etre unique si vous voulez une fiche produit differente
- `category` peut contenir plusieurs familles :

```text
Voiture / Organisation
```

- `image` peut contenir un lien de dossier Google Drive
- les images `.png`, `.jpg`, `.jpeg` sont prises automatiquement

## Rafraichissement du site

Si `NETLIFY_BUILD_HOOK_URL` est configure :

- toute modification de l'onglet `Produits`
- peut declencher automatiquement un rebuild Netlify

Pour une meilleure fiabilite, ajoutez aussi des triggers installables :

- `onEdit` -> From spreadsheet -> On edit
- `onChange` -> From spreadsheet -> On change
