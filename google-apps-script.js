// Google Apps Script unique
// GET  -> produits depuis l'onglet "Produits"
// POST -> commandes dans l'onglet "Commandes"
// Trigger edit/change -> rebuild Netlify optionnel
//
// Deploiement conseille :
// - Execute as: Me
// - Who has access: Anyone
//
// Script Properties conseillees :
// - SPREADSHEET_ID
// - NETLIFY_BUILD_HOOK_URL (optionnel)

function doGet(e) {
  return handleProductsRequest_(e);
}

function doPost(e) {
  return handleOrderRequest_(e);
}

function onEdit(e) {
  triggerNetlifyBuildIfProductsSheet_(e);
}

function onChange(e) {
  triggerNetlifyBuild_();
}

function handleProductsRequest_(e) {
  try {
    var spreadsheetId = getRequiredScriptProperty_('SPREADSHEET_ID');
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

    var seenIds = {};
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
        if (published === 'false' || published === '0' || published === 'no') return false;

        var key = String(product.id || product.slug || '').trim();
        if (!key) return true;
        if (seenIds[key]) return false;

        seenIds[key] = true;
        return true;
      });

    return jsonOutput_({ success: true, products: products });
  } catch (error) {
    return jsonOutput_({
      success: false,
      message: String(error)
    });
  }
}

function handleOrderRequest_(e) {
  try {
    var spreadsheetId = getRequiredScriptProperty_('SPREADSHEET_ID');
    var sheetName = 'Commandes';
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      throw new Error('Onglet introuvable: ' + sheetName);
    }

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

    var rowData = [
      new Date(),
      data.firstName || 'N/A',
      data.lastName || 'N/A',
      data.phone || 'N/A',
      data.product || 'N/A',
      data.color || 'N/A',
      data.quantity || '1',
      data.productSlug || 'N/A',
      data.price || 'N/A',
      data.address || 'N/A'
    ];

    sheet.appendRow(rowData);

    return jsonOutput_({
      success: true,
      message: 'Commande enregistree'
    });
  } catch (error) {
    return jsonOutput_({
      success: false,
      message: String(error)
    });
  }
}

function getRequiredScriptProperty_(key) {
  var value = PropertiesService.getScriptProperties().getProperty(key);

  if (!value) {
    throw new Error('Missing script property: ' + key);
  }

  return value;
}

function triggerNetlifyBuildIfProductsSheet_(e) {
  try {
    if (!e || !e.range) return;

    var sheet = e.range.getSheet();
    if (!sheet || sheet.getName() !== 'Produits') return;

    triggerNetlifyBuild_();
  } catch (error) {
    Logger.log('Netlify build hook skipped: ' + error);
  }
}

function triggerNetlifyBuild_() {
  try {
    var hookUrl = PropertiesService.getScriptProperties().getProperty('NETLIFY_BUILD_HOOK_URL');
    if (!hookUrl) return;

    UrlFetchApp.fetch(hookUrl, {
      method: 'post',
      muteHttpExceptions: true
    });
  } catch (error) {
    Logger.log('Netlify build hook failed: ' + error);
  }
}

function enrichProductImages_(product) {
  var source = String(product.image || product.images || '').trim();
  if (!source) {
    return product;
  }

  var folderId = extractDriveFolderId_(source);
  if (!folderId) {
    return product;
  }

  var images = getPublicImagesFromFolder_(folderId);
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

function getPublicImagesFromFolder_(folderId) {
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
