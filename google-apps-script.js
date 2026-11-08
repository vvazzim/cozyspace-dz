// ==============================================================================
// GOOGLE APPS SCRIPT - COZY SPACE DZ & ACE STORE E-COMMERCE ENGINE (v2.0.0)
// ==============================================================================
// Ce script unique gère :
// - GET  : lecture des produits (onglet "Produits") + diagnostic (?ping=1)
// - POST : enregistrement des commandes (onglet "Commandes")
// - Auto-initialisation : crée automatiquement les onglets et en-têtes si absents
//
// DÉPLOIEMENT :
// 1. Ouvrez votre Google Sheet > Extensions > Apps Script
// 2. Collez l'intégralité de ce code (remplacez le code existant)
// 3. Cliquez sur "Enregistrer" (icône disquette)
// 4. Cliquez sur "Déployer" > "Gérer les déploiements"
//    - Cliquez sur le crayon (Modifier)
//    - Version : choisissez OBLIGATOIREMENT "Nouvelle version"
//    - Exécuter en tant que : "Moi"
//    - Qui a accès : "Tout le monde" (Anyone)
//    - Cliquez sur "Déployer"
// ==============================================================================

const SCRIPT_VERSION = '2.0.0';

function doGet(e) {
  try {
    e = e || { parameter: {} };
    var params = e.parameter || {};

    // 1. Diagnostic / Ping
    if (params.ping || params.test || params.check) {
      return handlePingRequest_();
    }

    // 2. Commande envoyée en GET (fallback)
    if (params.action === 'order' || (params.phone && params.product)) {
      return handleOrderRequest_(e);
    }

    // 3. Par défaut : lecture du catalogue produits
    return handleProductsRequest_(e);
  } catch (error) {
    return jsonOutput_({
      success: false,
      error: String(error),
      version: SCRIPT_VERSION
    });
  }
}

function doPost(e) {
  try {
    return handleOrderRequest_(e);
  } catch (error) {
    return jsonOutput_({
      success: false,
      error: String(error),
      version: SCRIPT_VERSION
    });
  }
}

// ------------------------------------------------------------------------------
// GESTION DU CATALOGUE PRODUITS (GET)
// ------------------------------------------------------------------------------
function handleProductsRequest_(e) {
  var spreadsheet = getSpreadsheet_();
  var sheet = getOrCreateSheet_(spreadsheet, 'Produits');
  var values = sheet.getDataRange().getValues();

  if (!values || values.length <= 1) {
    return jsonOutput_({
      success: true,
      products: [],
      count: 0,
      version: SCRIPT_VERSION,
      message: 'Onglet Produits vide ou ne contient que les en-têtes.'
    });
  }

  var rawHeaders = values[0];
  var headers = rawHeaders.map(function (h) {
    return String(h || '').trim();
  });

  var seenKeys = {};
  var products = [];

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var hasContent = row.some(function (cell) {
      return String(cell || '').trim() !== '';
    });
    if (!hasContent) continue;

    var product = {};
    for (var c = 0; c < headers.length; c++) {
      var headerName = headers[c];
      if (headerName) {
        product[headerName] = row[c];
      }
    }

    // Filtre sur "published"
    var published = String(product.published === undefined ? 'TRUE' : product.published).trim().toLowerCase();
    if (published === 'false' || published === '0' || published === 'no' || published === 'non') {
      continue;
    }

    // Déduplication par id ou slug
    var key = String(product.id || product.slug || ('row-' + r)).trim();
    if (seenKeys[key]) continue;
    seenKeys[key] = true;

    // Enrichissement des images (Google Drive ou direct)
    product = enrichProductImages_(product);
    products.push(product);
  }

  return jsonOutput_({
    success: true,
    count: products.length,
    products: products,
    version: SCRIPT_VERSION
  });
}

// ------------------------------------------------------------------------------
// ENREGISTREMENT DES COMMANDES (POST / GET fallback)
// ------------------------------------------------------------------------------
function handleOrderRequest_(e) {
  var spreadsheet = getSpreadsheet_();
  var sheet = getOrCreateSheet_(spreadsheet, 'Commandes');

  var data = {};

  if (e && e.postData && e.postData.contents) {
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      data = parseFormEncodedPayload_(e.postData.contents);
    }
  }

  if (e && e.parameter && Object.keys(e.parameter).length) {
    data = Object.assign({}, data, e.parameter);
  }

  // Formatage date/heure Algérie
  var now = new Date();
  var timeZone = 'Africa/Algiers';
  var formattedDate = Utilities.formatDate(now, timeZone, 'yyyy-MM-dd HH:mm:ss');

  var firstName = String(data.firstName || data.prenom || '').trim() || 'N/A';
  var lastName = String(data.lastName || data.nom || '').trim() || 'N/A';
  var phone = String(data.phone || data.telephone || '').trim() || 'N/A';
  var product = String(data.product || data.produit || '').trim() || 'N/A';
  var color = String(data.color || data.couleur || '').trim() || 'N/A';
  var quantity = String(data.quantity || data.quantite || '1').trim() || '1';
  var productSlug = String(data.productSlug || data.slug || '').trim() || 'N/A';
  var price = String(data.price || data.prix || '').trim() || 'N/A';
  var address = String(data.address || data.adresse || '').trim() || 'N/A';
  var wilaya = String(data.wilaya || '').trim() || '';
  var status = 'Nouvelle';

  // Si une wilaya a été fournie séparément, l'inclure dans l'adresse
  if (wilaya && address.indexOf(wilaya) === -1) {
    address = wilaya + ' - ' + address;
  }

  var rowData = [
    formattedDate,
    firstName,
    lastName,
    phone,
    product,
    color,
    quantity,
    productSlug,
    price,
    address,
    status
  ];

  sheet.appendRow(rowData);

  return jsonOutput_({
    success: true,
    message: 'Commande enregistree avec succes',
    order: {
      date: formattedDate,
      name: firstName + ' ' + lastName,
      phone: phone,
      product: product,
      quantity: quantity
    },
    version: SCRIPT_VERSION
  });
}

// ------------------------------------------------------------------------------
// DIAGNOSTIC / PING
// ------------------------------------------------------------------------------
function handlePingRequest_() {
  var spreadsheet = getSpreadsheet_();
  var sheetProduits = getOrCreateSheet_(spreadsheet, 'Produits');
  var sheetCommandes = getOrCreateSheet_(spreadsheet, 'Commandes');

  var prodRows = Math.max(0, sheetProduits.getLastRow() - 1);
  var orderRows = Math.max(0, sheetCommandes.getLastRow() - 1);

  return jsonOutput_({
    success: true,
    status: 'connected',
    version: SCRIPT_VERSION,
    spreadsheetTitle: spreadsheet.getName(),
    spreadsheetId: spreadsheet.getId(),
    productsSheet: sheetProduits.getName(),
    productsCount: prodRows,
    ordersSheet: sheetCommandes.getName(),
    ordersCount: orderRows,
    serverTime: new Date().toISOString()
  });
}

// ------------------------------------------------------------------------------
// UTILITAIRES SPREADSHEET & SHEETS
// ------------------------------------------------------------------------------
function getSpreadsheet_() {
  // 1. Essai classeur actif (container-bound)
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  // 2. Essai propriété SPREADSHEET_ID
  var propId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (propId && propId.trim()) {
    return SpreadsheetApp.openById(propId.trim());
  }

  throw new Error(
    'Impossible d\'accéder au Spreadsheet. Si le script n\'est pas rattaché directement au Sheet, configurez SPREADSHEET_ID dans Paramètres du projet > Propriétés du script.'
  );
}

function getOrCreateSheet_(spreadsheet, sheetType) {
  var sheets = spreadsheet.getSheets();
  var targetNames = [];

  if (sheetType === 'Produits') {
    targetNames = ['produits', 'products', 'produit', 'articles'];
  } else if (sheetType === 'Commandes') {
    targetNames = ['commandes', 'orders', 'commande'];
  }

  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName().trim().toLowerCase();
    if (targetNames.indexOf(name) !== -1) {
      return sheets[i];
    }
  }

  // Si l'onglet n'existe pas, on le crée proprement avec ses en-têtes
  var newSheet = spreadsheet.insertSheet(sheetType);

  if (sheetType === 'Produits') {
    var productHeaders = [
      'id', 'slug', 'name', 'nameAr', 'baseName', 'baseNameAr',
      'color', 'colorAr', 'variantGroup', 'category', 'collection', 'collectionAr',
      'price', 'oldPrice', 'quantity', 'image',
      'shortDescription', 'shortDescriptionAr',
      'features', 'featuresAr', 'reasons', 'reasonsAr',
      'availability', 'availabilityAr', 'featured', 'published', 'tags'
    ];
    newSheet.appendRow(productHeaders);

    // Ajouter un produit démo exemple
    newSheet.appendRow([
      'p1',
      'miroir-lumineux-noir',
      'Miroir Lumineux Noir',
      'مرآة مضيئة سوداء',
      'Miroir Lumineux',
      'مرآة مضيئة',
      'Noir / Blanc',
      'أسود / أبيض',
      'miroir-lumineux',
      'Voiture / Beauté',
      'Luxe Quotidien',
      'أناقة يومية',
      '4 500 DA',
      '',
      '10',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
      'Un miroir lumineux noir élégant pour illuminer votre espace quotidien.',
      'مرآة مضيئة سوداء لإضافة لمسة راقية لمساحتك اليومية.',
      'Éclairage LED intégré|Design moderne|Finition noire élégante|Usage quotidien',
      'إضاءة LED مدمجة|تصميم عصري|تشطيب أسود أنيق|مناسبة للاستعمال اليومي',
      'Livraison dans toute l Algérie|Paiement à la livraison|Vérification avant paiement',
      'توصيل لكل الولايات|الدفع عند الاستلام|إمكانية التحقق قبل الدفع',
      'Disponible',
      'متوفر',
      'TRUE',
      'TRUE',
      'miroir|lumineux|noir|eclairage'
    ]);
  } else if (sheetType === 'Commandes') {
    var orderHeaders = [
      'Date / Heure',
      'Prénom',
      'Nom',
      'Téléphone',
      'Produit',
      'Couleur',
      'Quantité',
      'Slug Produit',
      'Prix',
      'Adresse',
      'Statut'
    ];
    newSheet.appendRow(orderHeaders);
  }

  return newSheet;
}

// ------------------------------------------------------------------------------
// GESTION DES IMAGES
// ------------------------------------------------------------------------------
function enrichProductImages_(product) {
  var source = String(product.image || product.images || '').trim();
  if (!source) return product;

  // Si c'est un dossier Google Drive
  var folderId = extractDriveFolderId_(source);
  if (folderId) {
    var folderImages = getPublicImagesFromFolder_(folderId);
    if (folderImages.length) {
      product.images = folderImages.map(function (img) { return img.url; });
      product.image = folderImages[0].url;
      return product;
    }
  }

  // Si c'est un ou plusieurs liens séparés par |
  if (source.indexOf('|') !== -1) {
    var list = source.split('|').map(function (item) {
      return normalizeSingleImageUrl_(item.trim());
    }).filter(Boolean);
    if (list.length) {
      product.images = list;
      product.image = list[0];
      return product;
    }
  }

  // Image unique
  var single = normalizeSingleImageUrl_(source);
  if (single) {
    product.image = single;
    product.images = [single];
  }

  return product;
}

function normalizeSingleImageUrl_(input) {
  var url = String(input || '').trim();
  if (!url) return '';

  var fileMatch = url.match(/\/file\/d\/([^/?#]+)/);
  if (fileMatch) {
    return 'https://drive.google.com/thumbnail?id=' + fileMatch[1] + '&sz=w1600';
  }

  var idMatch = url.match(/[?&]id=([^&]+)/);
  if (idMatch && url.indexOf('drive.google.com') !== -1) {
    return 'https://drive.google.com/thumbnail?id=' + idMatch[1] + '&sz=w1600';
  }

  return url;
}

function extractDriveFolderId_(input) {
  var value = String(input || '').trim();
  if (!value) return '';

  var folderMatch = value.match(/\/folders\/([^/?#]+)/);
  if (folderMatch) return folderMatch[1];

  var resourceMatch = value.match(/[?&]id=([^&]+)/);
  if (resourceMatch && value.indexOf('/folders/') !== -1) return resourceMatch[1];

  return '';
}

function getPublicImagesFromFolder_(folderId) {
  try {
    var folder = DriveApp.getFolderById(folderId);
    var files = folder.getFiles();
    var images = [];

    while (files.hasNext()) {
      var file = files.next();
      var name = String(file.getName() || '').toLowerCase();
      var mimeType = String(file.getMimeType() || '').toLowerCase();
      var isImage = mimeType === 'image/png' || mimeType === 'image/jpeg' || mimeType === 'image/webp' || /\.(png|jpe?g|webp)$/i.test(name);

      if (isImage) {
        images.push({
          name: file.getName(),
          url: 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1600'
        });
      }
    }

    images.sort(function (a, b) {
      return String(a.name).localeCompare(String(b.name), undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    });

    return images;
  } catch (error) {
    return [];
  }
}

// ------------------------------------------------------------------------------
// ENCODAGE & RÉPONSES
// ------------------------------------------------------------------------------
function parseFormEncodedPayload_(payload) {
  if (!payload) return {};

  return payload.split('&').reduce(function (acc, pair) {
    if (!pair) return acc;
    var parts = pair.split('=');
    var key = decodeURIComponent((parts[0] || '').replace(/\+/g, ' '));
    var value = decodeURIComponent((parts.slice(1).join('=') || '').replace(/\+/g, ' '));
    if (key) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function jsonOutput_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

// ------------------------------------------------------------------------------
// FONCTION DE TEST DANS L'ÉDITEUR
// ------------------------------------------------------------------------------
function testScript() {
  Logger.log('--- TEST DU SCRIPT v' + SCRIPT_VERSION + ' ---');
  var ping = handlePingRequest_();
  Logger.log('Ping result: ' + ping.getContent());

  var testOrder = {
    parameter: {
      firstName: 'Wassim',
      lastName: 'SWE Test',
      phone: '0555001122',
      product: 'Miroir Lumineux Test',
      color: 'Noir',
      quantity: '2',
      price: '4 500 DA',
      address: '16 Alger Centre',
      wilaya: '16 - Alger'
    }
  };

  var orderResult = handleOrderRequest_(testOrder);
  Logger.log('Order result: ' + orderResult.getContent());
}
