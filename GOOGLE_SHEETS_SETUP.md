# Configuration Google Sheets pour les commandes

## Étapes pour configurer l'intégration Google Sheets :

### 1. Créer un Google Sheet
- Allez sur [sheets.google.com](https://sheets.google.com)
- Créez un nouveau spreadsheet
- Ajoutez ces en-têtes dans la première ligne :
  - Timestamp
  - Prénom
  - Nom
  - Téléphone
  - Produit
  - Slug Produit
  - Adresse

### 2. Créer le Google Apps Script
- Dans votre Google Sheet, allez dans **Extensions > Apps Script**
- Supprimez le code par défaut et collez le contenu du fichier `google-apps-script.js`
- Remplacez `YOUR_SPREADSHEET_ID` par l'ID de votre spreadsheet (visible dans l'URL)

### 3. Déployer le script
- Cliquez sur **Déployer > Nouvelle déploiement**
- Sélectionnez le type **Application Web**
- Description : "API Commandes Miroirs"
- Execute as : **Me** (votre email)
- Who has access : **Anyone** (ou "Anyone with Google account" pour plus de sécurité)
- Cliquez sur **Déployer**

### 4. Récupérer l'URL du script
- Copiez l'URL fournie après le déploiement
- Elle ressemblera à : `https://script.google.com/macros/s/SCRIPT_ID/exec`

### 5. Mettre à jour le code du site
- Dans `src/components/OrderForm.astro`, remplacez `YOUR_SCRIPT_ID` par votre SCRIPT_ID réel
- Le formulaire enverra maintenant les données vers votre Google Sheet

## Sécurité
- Les données sont envoyées en HTTP (pas HTTPS) depuis Google Apps Script
- Pensez à protéger votre sheet si nécessaire
- Vous pouvez ajouter une authentification si vous voulez restreindre l'accès

## Test
- Testez le formulaire sur votre site
- Vérifiez que les données arrivent bien dans votre Google Sheet