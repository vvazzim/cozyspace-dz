# Google Products Setup

Cette documentation est maintenant simplifiee :

- utilisez un seul fichier Apps Script : `google-apps-script.js`
- utilisez un seul spreadsheet
- utilisez un seul deployment `/exec`

Ce fichier remplace l'ancien mode "script produits separé".

## A faire

1. Ouvrir votre projet Apps Script
2. Coller `google-apps-script.js`
3. Ajouter les Script Properties :

```text
SPREADSHEET_ID=VOTRE_SPREADSHEET_ID
NETLIFY_BUILD_HOOK_URL=VOTRE_URL_BUILD_HOOK_NETLIFY
```

4. Deploy en Web App :
   - Execute as: `Me`
   - Who has access: `Anyone`

## URL a utiliser dans le site

Utilisez la meme URL `/exec` pour :

```env
GOOGLE_SCRIPT_URL=VOTRE_URL_EXEC
PUBLIC_GOOGLE_SCRIPT_URL=VOTRE_URL_EXEC
PRODUCTS_FEED_URL=VOTRE_URL_EXEC
```

## Colonnes produits

```text
id	slug	name	nameAr	baseName	baseNameAr	color	colorAr	variantGroup	category	collection	collectionAr	price	oldPrice	quantity	image	shortDescription	shortDescriptionAr	features	featuresAr	reasons	reasonsAr	availability	availabilityAr	featured	published	tags
```

## Rappel

- `features` = points forts
- `reasons` = pourquoi choisir ce produit
- `category` peut contenir plusieurs familles :

```text
Maison / Organisation
Voiture / Beauté
```
