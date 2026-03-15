// Google Apps Script pour recevoir les commandes et les ajouter au Google Sheet
// À déployer comme Web App avec les permissions suivantes :
// - Execute: Anyone
// - Access: Anyone (ou Anyone with Google account si vous voulez restreindre)

// NOTE: N'oubliez pas de remplacer `YOUR_SPREADSHEET_ID` par l'ID réel de votre feuille
// de calcul (visible dans l'URL du Sheet), et non l'ID de déploiement du script.

/**
 * Pour les tests manuels dans l'éditeur Apps Script, on expose doGet.
 * Il ne doit pas utiliser de méthodes non supportées (setHeaders).
 */
function doGet(e) {
  // Dans notre implémentation client, on envoie les données en GET (query string)
  // pour contourner les limitations CORS de Google Apps Script.
  return handleOrderRequest(e);
}

function handleOrderRequest(e) {
  try {
    Logger.log('e: %s', JSON.stringify(e || {}));
    Logger.log('e.parameter: %s', JSON.stringify((e && e.parameter) || {}));
    Logger.log('e.parameters: %s', JSON.stringify((e && e.parameters) || {}));
    Logger.log('e.queryString: %s', (e && e.queryString) || '');
    Logger.log('e.postData: %s', JSON.stringify((e && e.postData) || {}));

    // Le payload peut être envoyé en JSON (POST), en form-urlencoded, ou en query string (GET).
    let data = {};

    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        Logger.log('Body non JSON, tentative de parsing form-urlencoded : %s', err);
        data = parseFormEncodedPayload_(e.postData.contents);
      }
    }

    if (e && e.parameter && Object.keys(e.parameter).length) {
      data = { ...data, ...e.parameter };
    }

    Logger.log('Order data received: %s', JSON.stringify(data));

    // ID de votre Google Sheet (visible dans l'URL du Sheet)
    // Exemple : https://docs.google.com/spreadsheets/d/<ID>/edit
    const spreadsheetId = 'YOUR_SPREADSHEET_ID';

    const sheet = SpreadsheetApp.openById(spreadsheetId).getSheets()[0];

    const rowData = [
      new Date(), // Timestamp
      data.firstName || 'N/A',
      data.lastName || 'N/A',
      data.phone || 'N/A',
      data.product || 'N/A',
      data.quantity || '1',
      data.productSlug || 'N/A',
      data.price || 'N/A',
      data.address || 'N/A'
    ];

    sheet.appendRow(rowData);
    Logger.log('Commande ajoutée au Sheet. ID sheet: %s', spreadsheetId);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Commande enregistrée' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  return handleOrderRequest(e);
}

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

// Fonction de test (optionnelle)
function testScript() {
  const testData = {
    firstName: 'Test',
    lastName: 'User',
    phone: '0123456789',
    product: 'Miroir Lumineux Noir',
    quantity: '1',
    productSlug: 'miroir-lumineux-noir',
    price: '4 500 DA',
    address: '123 Test Street'
  };

  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(e);
  Logger.log(result.getContent());
}
