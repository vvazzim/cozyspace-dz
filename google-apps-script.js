// Google Apps Script pour recevoir les commandes et les ajouter au Google Sheet
// A deployer comme Web App avec les permissions suivantes :
// - Execute: Anyone
// - Access: Anyone

function doGet(e) {
  return handleOrderRequest(e);
}

function doPost(e) {
  return handleOrderRequest(e);
}

function handleOrderRequest(e) {
  try {
    Logger.log('e: %s', JSON.stringify(e || {}));
    Logger.log('e.parameter: %s', JSON.stringify((e && e.parameter) || {}));
    Logger.log('e.parameters: %s', JSON.stringify((e && e.parameters) || {}));
    Logger.log('e.queryString: %s', (e && e.queryString) || '');
    Logger.log('e.postData: %s', JSON.stringify((e && e.postData) || {}));

    var data = {};

    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        Logger.log('Body non JSON, tentative de parsing form-urlencoded : %s', err);
        data = parseFormEncodedPayload_(e.postData.contents);
      }
    }

    if (e && e.parameter && Object.keys(e.parameter).length) {
      data = Object.assign({}, data, e.parameter);
    }

    Logger.log('Order data received: %s', JSON.stringify(data));

    var spreadsheetId = '1Do4iJU8TdtvwmODoH_ypc1xdrZTouUCxhOxVQTJK_do';
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheets()[0];

    var rowData = [
      new Date(),
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
    Logger.log('Commande ajoutee au Sheet. ID sheet: %s', spreadsheetId);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Commande enregistree' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Erreur handleOrderRequest: %s', error.toString());

    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
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

function testScript() {
  var testData = {
    firstName: 'Test',
    lastName: 'User',
    phone: '0123456789',
    product: 'Miroir Lumineux Noir',
    quantity: '1',
    productSlug: 'miroir-lumineux-noir',
    price: '4 500 DA',
    address: '123 Test Street'
  };

  var e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  var result = doPost(e);
  Logger.log(result.getContent());
}
