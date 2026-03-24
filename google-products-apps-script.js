// Google Apps Script pour exposer les produits depuis l'onglet "Produits"
// Utilisez de preference le meme fichier Google Sheets que pour les commandes.
// Onglets recommandes :
// - Commandes
// - Produits
//
// Deploiement conseille :
// - Execute as: Me
// - Who has access: Anyone

function doGet() {
  try {
    var spreadsheetId = 'YOUR_SPREADSHEET_ID';
    var sheetName = 'Produits';
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      throw new Error('Onglet introuvable: ' + sheetName);
    }

    var values = sheet.getDataRange().getValues();
    if (!values.length) {
      return jsonOutput_({ success: true, products: [] });
    }

    var headers = values[0].map(function (header) {
      return String(header || '').trim();
    });

    var products = values
      .slice(1)
      .filter(function (row) {
        return row.some(function (cell) {
          return String(cell || '').trim() !== '';
        });
      })
      .map(function (row) {
        var product = headers.reduce(function (acc, header, index) {
          acc[header] = row[index];
          return acc;
        }, {});

        return enrichProductImages_(product);
      })
      .filter(function (product) {
        var published = String(product.published || 'TRUE').toLowerCase();
        return published !== 'false' && published !== '0' && published !== 'no';
      });

    return jsonOutput_({ success: true, products: products });
  } catch (error) {
    return jsonOutput_({ success: false, message: error.toString() });
  }
}

function enrichProductImages_(product) {
  var source = String(product.image || product.images || '').trim();
  if (!source) {
    product.imagesDebug = 'no-source';
    return product;
  }

  var folderId = extractDriveFolderId_(source);
  if (!folderId) {
    product.imagesDebug = 'no-folder-id';
    return product;
  }

  var images = getPublicPngsFromFolder_(folderId);
  product.imagesDebug = {
    folderId: folderId,
    count: images.length
  };

  if (!images.length) return product;

  product.images = images.map(function (image) {
    return image.url;
  });
  product.image = images[0].url;
  return product;
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

function getPublicPngsFromFolder_(folderId) {
  try {
    var folder = DriveApp.getFolderById(folderId);
    var files = folder.getFiles();
    var images = [];

    while (files.hasNext()) {
      var file = files.next();
      var name = String(file.getName() || '').toLowerCase();
      var mimeType = String(file.getMimeType() || '').toLowerCase();
      var isImage = mimeType === 'image/png' || mimeType === 'image/jpeg' || /\.(png|jpe?g)$/i.test(name);

      if (isImage) {
        images.push({
          name: file.getName(),
          url: 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1600'
        });
      }
    }

    images.sort(function (a, b) {
      return String(a.name).localeCompare(String(b.name), undefined, { numeric: true, sensitivity: 'base' });
    });

    return images;
  } catch (error) {
    return [];
  }
}

function jsonOutput_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
