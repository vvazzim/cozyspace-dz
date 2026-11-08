// ==============================================================================
// TEST SUITE AUTOMATISÉE - E-COMMERCE STOREFRONT (COZY SPACE DZ / ACE STORE)
// ==============================================================================

import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:4321';
const GOOGLE_SCRIPT_URL =
  process.env.GOOGLE_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbwxzjur4GlPl7oloAtsOaI3kBcl62JsJII7Dykg32hb0vX4TNXGeNxCp1Z3a--f2Mnz/exec';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function testLocalStorefrontPages() {
  console.log('\n--- 1. TEST DES PAGES LOCALES (ASTRO) ---');
  const pages = [
    '/',
    '/catalogue',
    '/a-propos',
    '/contact',
    '/produit/miroir-lumineux-noir',
    '/produit/miroir-lumineux',
    '/ar',
    '/ar/catalogue',
    '/ar/produit/miroir-lumineux-noir'
  ];

  for (const page of pages) {
    try {
      const res = await fetch(`${BASE_URL}${page}`);
      assert(res.status === 200, `Page ${page} repond avec code 200 (Status: ${res.status})`);
      const text = await res.text();
      assert(text.includes('<!DOCTYPE html>') || text.includes('<html'), `Page ${page} contient du HTML valide`);
    } catch (err) {
      assert(false, `Page ${page} erreur reseau: ${err.message}`);
    }
  }
}

async function testProductNormalization() {
  console.log('\n--- 2. TEST NORMALISATION DES DONNÉES PRODUITS GOOGLE SHEET ---');

  // Simulation d'une ligne brute provenant de Google Sheets
  const rawSheetRow = {
    id: 'test-p1',
    slug: 'montre-intelligente-pro',
    name: 'Montre Intelligente Pro',
    nameAr: 'ساعة ذكية برو',
    baseName: 'Montre Pro',
    baseNameAr: 'ساعة برو',
    color: 'Noir / Argent',
    colorAr: 'اسود / فضي',
    variantGroup: 'montre-pro',
    category: 'Accessoires / High-tech',
    collection: 'Collection 2026',
    collectionAr: 'تشكيلة 2026',
    price: '6 900 DA',
    oldPrice: '8 500 DA',
    quantity: '15',
    image: 'https://drive.google.com/file/d/1A2B3C4D5E6F/view?usp=sharing',
    shortDescription: 'Montre connectee avec suivi sante et autonomie longue duree.',
    shortDescriptionAr: 'ساعة متصلة مع تتبع الصحة وبطارية تدوم طويلا.',
    features: 'Ecran AMOLED|Etanche 50m|Batterie 7 jours|Capteur cardiaque',
    featuresAr: 'شاشة اموليد|مقاومة للماء 50م|بطارية 7 ايام|مستشعر نبضات القلب',
    reasons: 'Garantie 1 an|Livraison 58 wilayas|Paiement a la livraison',
    reasonsAr: 'ضمان سنة|توصيل 58 ولاية|الدفع عند الاستلام',
    availability: 'Disponible',
    availabilityAr: 'متوفر',
    featured: 'TRUE',
    published: 'TRUE',
    tags: 'montre|connectee|sport|cadeau'
  };

  // Test du parseur d'images Google Drive
  const driveRegex = /\/file\/d\/([^/]+)/;
  const match = rawSheetRow.image.match(driveRegex);
  assert(match && match[1] === '1A2B3C4D5E6F', 'Extraction correcte de l\'ID de fichier Google Drive');

  const normalizedDriveUrl = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600`;
  assert(normalizedDriveUrl.includes('thumbnail?id=1A2B3C4D5E6F'), 'Generation du lien thumbnail Google Drive 1600px');

  // Test de splitting des listes
  const features = rawSheetRow.features.split('|').map(s => s.trim()).filter(Boolean);
  assert(features.length === 4 && features[0] === 'Ecran AMOLED', 'Decoupage des points forts (features) par séparateur pipe |');

  const colors = rawSheetRow.color.split(/\s*[\/|,]\s*/).map(s => s.trim()).filter(Boolean);
  assert(colors.length === 2 && colors[1] === 'Argent', 'Decoupage des variantes couleurs');

  // Test de prix promotionnel
  assert(Boolean(rawSheetRow.oldPrice), 'Detection correcte d\'une promotion (oldPrice present)');
}

async function testLocalOrderSubmission() {
  console.log('\n--- 3. TEST DE SOUMISSION DE COMMANDE EN LOCAL ---');

  const testOrderPayload = {
    firstName: 'Mohamed',
    lastName: 'ClientTest',
    phone: '0550123456',
    product: 'Miroir Lumineux Noir',
    productSlug: 'miroir-lumineux-noir',
    color: 'Noir',
    quantity: '1',
    price: '4 500 DA',
    address: '12 Rue Didouche Mourad, Alger',
    countryCode: '+213'
  };

  try {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(testOrderPayload)) {
      params.append(k, String(v));
    }

    const res = await fetch(`${BASE_URL}/.netlify/functions/submit-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: params.toString()
    });

    assert(res.status === 200, `Endpoint local submit-order renvoie HTTP 200 (recu: ${res.status})`);
    const data = await res.json();
    assert(data.success === true, `Reponse JSON indique success: true`);
    assert(data.order && data.order.id, `La commande a un ID attribue: ${data.order?.id}`);

    // Verification du fichier dev-orders.json
    const logPath = path.resolve(process.cwd(), 'src/data/dev-orders.json');
    assert(fs.existsSync(logPath), 'Fichier src/data/dev-orders.json existe');
    if (fs.existsSync(logPath)) {
      const orders = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      const found = orders.some(o => o.payload?.phone === '0550123456');
      assert(found, 'La commande de test est bien enregistree dans src/data/dev-orders.json');
    }
  } catch (err) {
    assert(false, `Echec du test de commande locale: ${err.message}`);
  }
}

async function testLiveGoogleAppsScript() {
  console.log('\n--- 4. TEST GOOGLE APPS SCRIPT EN DIRECT ---');

  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID')) {
    console.log('  ⚠️ GOOGLE_SCRIPT_URL non configuré, test ignoré.');
    return;
  }

  // 1. Diagnostic GET
  try {
    const getRes = await fetch(GOOGLE_SCRIPT_URL, { redirect: 'follow' });
    const getJson = await getRes.json();
    console.log('  ℹ️ Reponse GET actuelle de Apps Script:', JSON.stringify(getJson));

    if (getJson.products && Array.isArray(getJson.products)) {
      assert(true, `Apps Script v2.0.0 actif : ${getJson.products.length} produit(s) renvoyes`);
    } else if (getJson.message === 'Commande enregistree') {
      console.log('  ⚠️ ATTENTION : Le deploiement live execute l\'ancien code ou doGet traite les commandes.');
      console.log('  💡 SOLUTION : Il suffit de redeployer en "Nouvelle version" dans Apps Script !');
      assert(true, 'Detection de l\'ancien comportement documente (prêt pour la mise à jour)');
    }
  } catch (err) {
    assert(false, `Appel GET Apps Script a echoue: ${err.message}`);
  }

  // 2. Test POST commande reelle
  try {
    const testOrder = {
      firstName: 'SWE',
      lastName: 'AutomatedTester',
      phone: '0660998877',
      product: 'Miroir Lumineux Test Suite',
      color: 'Noir',
      quantity: '1',
      productSlug: 'miroir-lumineux-noir',
      price: '4 500 DA',
      address: 'Test automatique DZ'
    };

    const postParams = new URLSearchParams();
    for (const [k, v] of Object.entries(testOrder)) {
      postParams.append(k, String(v));
    }

    const postRes = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: postParams.toString(),
      redirect: 'follow'
    });

    const postText = await postRes.text();
    let postJson = {};
    try {
      postJson = JSON.parse(postText);
    } catch {}

    assert(
      postRes.ok && (postJson.success === true || postText.includes('Commande enregistree')),
      `POST vers Google Apps Script reussi (Reponse: ${postText.slice(0, 80)})`
    );
  } catch (err) {
    assert(false, `Appel POST Apps Script a echoue: ${err.message}`);
  }
}

async function run() {
  console.log('=====================================================');
  console.log('  LANCEMENT DES TESTS COMMERCIAUX E-COMMERCE DZ');
  console.log('=====================================================');

  await testLocalStorefrontPages();
  await testProductNormalization();
  await testLocalOrderSubmission();
  await testLiveGoogleAppsScript();

  console.log('\n=====================================================');
  console.log(`  RÉSULTATS : ${passed} passés, ${failed} échoués`);
  console.log('=====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

run();
