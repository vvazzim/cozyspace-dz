/**
 * Synchronisation dynamique en direct du catalogue Cozy Space DZ depuis Google Sheets.
 */

const DEFAULT_FEED_URL =
  'https://script.google.com/macros/s/AKfycbwxzjur4GlPl7oloAtsOaI3kBcl62JsJII7Dykg32hb0vX4TNXGeNxCp1Z3a--f2Mnz/exec';

const DEFAULT_SHEET_ID = '1Do4iJU8TdtvwmODoH_ypc1xdrZTouUCxhOxVQTJK_do';

export interface LiveProduct {
  id: string;
  slug: string;
  name: string;
  nameAr?: string;
  baseName?: string;
  baseNameAr?: string;
  color?: string;
  colorAr?: string;
  price: string;
  oldPrice?: string;
  quantity?: number;
  image?: string;
  images?: string[];
  category?: string;
  shortDescription?: string;
  shortDescriptionAr?: string;
  features?: string[];
  featuresAr?: string[];
  reasons?: string[];
  reasonsAr?: string[];
  availability?: string;
  availabilityAr?: string;
  published?: boolean | string;
}

function parseCsv(csvText: string): Record<string, string>[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if (char === '\n' && !inQuotes) {
      lines.push(currentLine);
      currentLine = '';
    } else if (char === '\r' && !inQuotes) {
      // ignore
    } else {
      currentLine += char;
    }
  }
  if (currentLine) lines.push(currentLine);
  if (lines.length < 2) return [];

  const parseRow = (line: string): string[] => {
    const row: string[] = [];
    let field = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQ && line[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQ = !inQ;
        }
      } else if (char === ',' && !inQ) {
        row.push(field.trim());
        field = '';
      } else {
        field += char;
      }
    }
    row.push(field.trim());
    return row;
  };

  const headers = parseRow(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const row: Record<string, string> = {};
    let hasValue = false;
    for (let h = 0; h < headers.length; h++) {
      const val = (values[h] || '').replace(/^["']|["']$/g, '').trim();
      row[headers[h]] = val;
      row[headers[h].toLowerCase().replace(/[\s_-]/g, '')] = val;
      if (val) hasValue = true;
    }
    const rowId = row.id || row.Id || row.ID || row.slug || row.Slug;
    if (hasValue && rowId) rows.push(row);
  }

  return rows;
}

function cleanCell(str?: string): string {
  if (!str) return '';
  let s = String(str).trim();
  if (s.includes('│')) {
    s = s.split('│')[0].trim();
  }
  return s;
}

function splitPipes(str?: string): string[] {
  if (!str) return [];
  return str
    .replace(/│/g, '|')
    .split('|')
    .map((s) => cleanCell(s))
    .filter(Boolean);
}

function getVal(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      return cleanCell(row[k]);
    }
    const cleanK = k.toLowerCase().replace(/[\s_-]/g, '');
    if (row[cleanK] !== undefined && row[cleanK] !== null && String(row[cleanK]).trim() !== '') {
      return cleanCell(row[cleanK]);
    }
  }
  return '';
}

export async function fetchLiveProducts(sheetId = DEFAULT_SHEET_ID, feedUrl = DEFAULT_FEED_URL): Promise<LiveProduct[]> {
  const ts = Date.now();

  if (sheetId) {
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Produits&_ts=${ts}`;
      const res = await fetch(csvUrl, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        const rows = parseCsv(text);
        if (rows.length > 0) {
          return rows.map((r, idx) => {
            const rawQty = getVal(r, 'quantity', 'stock', 'qte', 'quantite');
            const qtyNum = Number.parseInt(rawQty, 10);
            return {
              id: getVal(r, 'id') || `p${idx + 1}`,
              slug: getVal(r, 'slug') || `prod-${idx + 1}`,
              name: getVal(r, 'name', 'nom', 'title', 'titre'),
              nameAr: getVal(r, 'nameAr', 'nomAr', 'name_ar', 'nom_ar'),
              baseName: getVal(r, 'baseName', 'nomBase', 'base_name') || getVal(r, 'name', 'nom'),
              baseNameAr: getVal(r, 'baseNameAr', 'nomBaseAr', 'base_name_ar') || getVal(r, 'nameAr', 'nomAr'),
              color: getVal(r, 'color', 'couleur'),
              colorAr: getVal(r, 'colorAr', 'couleurAr', 'color_ar'),
              variantGroup: getVal(r, 'variantGroup', 'groupe', 'variant_group'),
              category: getVal(r, 'category', 'categorie'),
              price: getVal(r, 'price', 'prix', 'Price', 'Prix', 'tarif'),
              oldPrice: getVal(r, 'oldPrice', 'old_price', 'ancienPrix', 'ancien_prix'),
              quantity: Number.isFinite(qtyNum) ? qtyNum : undefined,
              shortDescription: getVal(r, 'shortDescription', 'description', 'short_description', 'desc'),
              shortDescriptionAr: getVal(r, 'shortDescriptionAr', 'descriptionAr', 'short_description_ar', 'descAr'),
              features: splitPipes(getVal(r, 'features', 'caracteristiques', 'points_forts')),
              featuresAr: splitPipes(getVal(r, 'featuresAr', 'caracteristiquesAr')),
              reasons: splitPipes(getVal(r, 'reasons', 'raisons', 'pourquoi')),
              reasonsAr: splitPipes(getVal(r, 'reasonsAr', 'raisonsAr')),
              availability: getVal(r, 'availability', 'disponibilite'),
              availabilityAr: getVal(r, 'availabilityAr', 'disponibiliteAr'),
              published: getVal(r, 'published', 'publie') || 'true'
            };
          });
        }
      }
    } catch {}
  }

  if (feedUrl) {
    try {
      const res = await fetch(`${feedUrl}?_ts=${ts}`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.products)) {
          return data.products;
        }
      }
    } catch {}
  }

  return [];
}

export function initLiveProductDetailSync(options: {
  slug: string;
  locale?: 'fr' | 'ar';
  sheetId?: string;
  feedUrl?: string;
}) {
  if (typeof window === 'undefined') return;

  const { slug, locale = 'fr', sheetId = DEFAULT_SHEET_ID, feedUrl = DEFAULT_FEED_URL } = options;
  const isAr = locale === 'ar';

  async function updateProductDetail() {
    try {
      const products = await fetchLiveProducts(sheetId, feedUrl);
      if (!products || !products.length) return;

      const targetSlug = slug.toLowerCase().trim();
      const prod = products.find(
        (p) => String(p.slug || '').toLowerCase().trim() === targetSlug ||
               String(p.id || '').toLowerCase().trim() === targetSlug
      );

      if (!prod) return;

      if (prod.price) {
        const livePriceEls = document.querySelectorAll('[data-live-price]');
        livePriceEls.forEach((el) => {
          el.textContent = prod.price;
        });

        const liveOldPriceEls = document.querySelectorAll('[data-live-old-price]');
        liveOldPriceEls.forEach((el) => {
          if (prod.oldPrice) {
            el.textContent = prod.oldPrice;
            el.classList.remove('hidden');
          } else {
            el.classList.add('hidden');
          }
        });

        const formPriceInput = document.querySelector('input[name="price"]') as HTMLInputElement;
        if (formPriceInput) {
          formPriceInput.value = prod.price;
        }
      }

      const liveTitle = isAr ? prod.baseNameAr || prod.nameAr || prod.baseName || prod.name : prod.baseName || prod.name;
      if (liveTitle) {
        const liveTitleEls = document.querySelectorAll('[data-live-title]');
        liveTitleEls.forEach((el) => {
          el.textContent = liveTitle;
        });

        const formProductInput = document.querySelector('input[name="product"]') as HTMLInputElement;
        if (formProductInput) {
          formProductInput.value = isAr ? prod.nameAr || prod.name : prod.name;
        }
      }

      const liveDesc = isAr ? prod.shortDescriptionAr || prod.shortDescription : prod.shortDescription;
      if (liveDesc) {
        const liveDescEls = document.querySelectorAll('[data-live-desc]');
        liveDescEls.forEach((el) => {
          el.textContent = liveDesc;
        });
        const liveKickerEls = document.querySelectorAll('[data-live-kicker]');
        liveKickerEls.forEach((el) => {
          el.textContent = liveDesc;
        });
      }

      // 4. Mettre à jour les points forts
      const features = isAr ? prod.featuresAr || prod.features : prod.features;
      if (features && features.length) {
        const featuresContainer = document.querySelector('[data-live-features]');
        if (featuresContainer) {
          featuresContainer.innerHTML = '';
          features.forEach((feat) => {
            const li = document.createElement('li');
            li.className = 'flex items-start gap-3';
            li.innerHTML = `
              <span class="mt-1 h-2.5 w-2.5 rounded-full bg-brand-gold flex-shrink-0"></span>
              <span>${feat}</span>
            `;
            featuresContainer.appendChild(li);
          });
        }
      }

      const isOutOfStock =
        (typeof prod.quantity === 'number' && prod.quantity <= 0) ||
        (prod.availability && prod.availability.toLowerCase().includes('rupture')) ||
        (prod.published !== undefined && String(prod.published).toLowerCase() === 'false');

      const submitBtn = document.querySelector('#order-form button[type="submit"]') as HTMLButtonElement;
      if (submitBtn) {
        if (isOutOfStock) {
          submitBtn.setAttribute('disabled', 'disabled');
          submitBtn.textContent = isAr ? 'نفذت الكمية (غير متوفر)' : 'Rupture de stock';
          submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
          submitBtn.removeAttribute('disabled');
          submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
      }

      console.info(`[live-sync] Cozy Space DZ synchronisée en direct (Prix: ${prod.price})`);
    } catch (err) {
      console.warn('[live-sync] Notice:', err);
    }
  }

  updateProductDetail();
}

export function initLiveProductSync(options: {
  containerId: string;
  locale?: 'fr' | 'ar';
  emptyPlaceholderId?: string;
  sheetId?: string;
  feedUrl?: string;
}) {
  if (typeof window === 'undefined') return;

  const {
    containerId,
    locale = 'fr',
    emptyPlaceholderId,
    sheetId = DEFAULT_SHEET_ID,
    feedUrl = DEFAULT_FEED_URL
  } = options;
  const container = document.getElementById(containerId);
  const emptyPlaceholder = emptyPlaceholderId ? document.getElementById(emptyPlaceholderId) : null;

  async function checkLiveUpdates() {
    try {
      const products = await fetchLiveProducts(sheetId, feedUrl);
      if (!products || !products.length) return;

      const published = products.filter(
        (p) => String(p.published).toLowerCase() !== 'false' && String(p.published).toLowerCase() !== '0'
      );

      if (!published.length) return;

      if (emptyPlaceholder && (!container || container.children.length === 0)) {
        emptyPlaceholder.classList.add('hidden');
      }

      const grid = container || document.getElementById('products-grid');
      if (!grid) return;

      for (const prod of published) {
        const slug = String(prod.slug || '').trim();
        if (!slug) continue;

        const existingCard = grid.querySelector(`[data-slug="${slug}"]`);

        if (existingCard) {
          const priceEl = existingCard.querySelector('[data-price-val]');
          if (priceEl && prod.price && priceEl.textContent?.trim() !== prod.price.trim()) {
            priceEl.textContent = prod.price;
          }
        }
      }
    } catch (err) {
      console.warn('[live-sync] Notice:', err);
    }
  }

  checkLiveUpdates();
}
