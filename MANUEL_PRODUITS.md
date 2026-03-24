# Manuel Produits Cozy Space DZ

## Vue d'ensemble

Le site utilise :

- un seul Google Sheets
- un seul Google Apps Script
- une seule URL `/exec`

Le meme script sert pour :

- les produits
- les commandes
- le rebuild automatique Netlify si un Build Hook est configure

## Onglets obligatoires dans le Google Sheets

Le spreadsheet doit contenir deux onglets :

- `Produits`
- `Commandes`

## Script Apps Script a utiliser

Le seul fichier a coller dans Apps Script est :

- `google-apps-script.js`

Ne colle pas `google-products-apps-script.js`.
Ce fichier n'est plus qu'un repere local.

## Deployment Apps Script

Dans Apps Script :

1. `Deploy`
2. `New deployment`
3. `Application Web`
4. Parametres :

- `Description` : `Cozy Space DZ - Produits et commandes`
- `Executer en tant que` : `Moi`
- `Qui a acces` : `Tout le monde`

## Script Properties

Dans `Project Settings` > `Script properties`, ajoute :

```text
SPREADSHEET_ID=VOTRE_ID_GOOGLE_SHEET
NETLIFY_BUILD_HOOK_URL=VOTRE_URL_BUILD_HOOK_NETLIFY
```

`NETLIFY_BUILD_HOOK_URL` est optionnel mais recommande.

## Variables d'environnement du site

Utilise la meme URL `/exec` pour :

```env
GOOGLE_SCRIPT_URL=VOTRE_URL_EXEC
PUBLIC_GOOGLE_SCRIPT_URL=VOTRE_URL_EXEC
PRODUCTS_FEED_URL=VOTRE_URL_EXEC
```

## Colonnes de l'onglet Produits

Colle exactement cette ligne d'en-tetes :

```text
id	slug	name	nameAr	baseName	baseNameAr	color	colorAr	variantGroup	category	collection	collectionAr	price	oldPrice	quantity	image	shortDescription	shortDescriptionAr	features	featuresAr	reasons	reasonsAr	availability	availabilityAr	featured	published	tags
```

## Explication simple des colonnes

- `id` : identifiant unique du produit
- `slug` : lien unique du produit sur le site
- `name` : nom du produit en francais
- `nameAr` : nom du produit en arabe
- `baseName` : nom court en francais
- `baseNameAr` : nom court en arabe
- `color` : couleur ou couleurs en francais
- `colorAr` : couleur ou couleurs en arabe
- `variantGroup` : groupe de variantes
- `category` : famille du produit
- `collection` : collection en francais
- `collectionAr` : collection en arabe
- `price` : prix actuel
- `oldPrice` : ancien prix si promotion
- `quantity` : stock
- `image` : lien du dossier Google Drive
- `shortDescription` : petite description en francais
- `shortDescriptionAr` : petite description en arabe
- `features` : points forts en francais, separes par `|`
- `featuresAr` : points forts en arabe, separes par `|`
- `reasons` : pourquoi choisir ce produit en francais, separes par `|`
- `reasonsAr` : pourquoi choisir ce produit en arabe, separes par `|`
- `availability` : disponibilite en francais
- `availabilityAr` : disponibilite en arabe
- `featured` : `TRUE` si mis en avant
- `published` : `TRUE` si visible sur le site
- `tags` : mots-cles separes par `|`

## Regles importantes

- `id` doit etre unique
- `slug` doit etre unique si tu veux une fiche produit differente
- `category` peut contenir plusieurs familles

Exemple :

```text
Voiture / Organisation
Maison / Beaute
```

- `features` = bloc `Points forts`
- `reasons` = bloc `Pourquoi choisir ce produit ?`

## Images Google Drive

Dans la colonne `image`, colle un lien de dossier Drive, par exemple :

```text
https://drive.google.com/drive/folders/VOTRE_FOLDER_ID?usp=sharing
```

Le script recupere automatiquement les images :

- `.png`
- `.jpg`
- `.jpeg`

## Exemple de ligne produit

```text
p1	miroir-lumineux-noir	Miroir Lumineux Noir	مرآة LED للسيارة	Miroir Lumineux	مرآة مضيئة	Noir / Blanc	أسود / أبيض	miroir-lumineux	Voiture / Beaute	Luxe Quotidien	أناقة يومية	2 800 DA		8	https://drive.google.com/drive/folders/156u6zuBTOugqtSbqE0xP0nwMrzuY6s4l?usp=drive_link	Un miroir lumineux noir elegant pour illuminer votre espace quotidien.	مرآة مضيئة سوداء لاضافة لمسة راقية لمساحتك اليومية.	Eclairage LED integre|Design moderne|Finition noire elegante|Usage quotidien	اضاءة LED مدمجة|تصميم عصري|تشطيب اسود انيق|استعمال يومي	Livraison dans toute l Algerie|Paiement a la livraison|Verification avant paiement	توصيل لكل الولايات|الدفع عند الاستلام|إمكانية التحقق قبل الدفع	Disponible	متوفر	TRUE	TRUE	miroir|lumineux|noir|eclairage
```

## Rebuild automatique Netlify

Si `NETLIFY_BUILD_HOOK_URL` est configure :

- toute modification de l'onglet `Produits`
- peut relancer automatiquement un deploy Netlify

Pour une meilleure fiabilite, ajoute aussi ces triggers installables dans Apps Script :

- `onEdit` -> `From spreadsheet` -> `On edit`
- `onChange` -> `From spreadsheet` -> `On change`

## Colonnes de l'onglet Commandes

Tu peux utiliser :

```text
Timestamp	Prenom	Nom	Telephone	Produit	Couleur	Quantite	Slug Produit	Prix	Adresse
```

## Verifications rapides

### Verifier les produits

Ouvre l'URL `/exec`.
Tu dois voir un JSON avec :

- `success: true`
- `products: [...]`

### Verifier les commandes

Passe une commande test depuis le site.
La commande doit apparaitre dans l'onglet `Commandes`.

### Verifier le rebuild automatique

Modifie une cellule dans `Produits`.
Netlify doit lancer un nouveau deploy si le hook est configure.
