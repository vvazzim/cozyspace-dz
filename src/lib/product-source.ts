import { products as localProducts } from '../data/products';
import type { Product } from './types';

const PRODUCTS_FEED_URL =
  import.meta.env.PRODUCTS_FEED_URL || import.meta.env.PUBLIC_PRODUCTS_FEED_URL || '';

const IS_DEV = import.meta.env.DEV;
const PRODUCT_CACHE_TTL_MS = IS_DEV ? 0 : 60_000;

const defaultProduct: Product = localProducts[0];
let cachedProductsPromise: Promise<Product[]> | null = null;
let cachedProductsAt = 0;

const splitList = (value: unknown) =>
  String(value || '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);

const splitColorList = (value: unknown) =>
  String(value || '')
    .split(/\s*[\/|,]\s*/)
    .map((item) => item.trim())
    .filter(Boolean);

const splitCategoryList = (value: unknown) =>
  String(value || '')
    .split(/\s*[\/|,]\s*/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const normalizeBoolean = (value: unknown, fallback = false) => {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!normalized) return fallback;
  return ['true', '1', 'yes', 'oui'].includes(normalized);
};

const normalizeDriveImage = (value: unknown) => {
  const input = String(value || '').trim();
  if (!input) return '';

  const fileMatch = input.match(/\/file\/d\/([^/]+)/);
  if (fileMatch) return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w1600`;

  const idMatch = input.match(/[?&]id=([^&]+)/);
  if (idMatch) return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1600`;

  return input;
};

const normalizeDriveImages = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeDriveImage(item)).filter(Boolean);
  }

  const input = String(value || '').trim();
  if (!input) return [];

  if (input.includes('|')) {
    return input
      .split('|')
      .map((item) => normalizeDriveImage(item))
      .filter(Boolean);
  }

  const image = normalizeDriveImage(input);
  return image ? [image] : [];
};

const normalizeProduct = (row: Record<string, unknown>, index: number): Product => {
  const images = normalizeDriveImages(row.images || row.image);
  const quantityValue = Number.parseInt(String(row.quantity ?? ''), 10);
  const quantity = Number.isFinite(quantityValue) ? quantityValue : undefined;
  const published = normalizeBoolean(row.published, true);
  const featured = normalizeBoolean(row.featured, false);

  return {
    id: String(row.id || `sheet-product-${index + 1}`),
    slug: String(row.slug || `produit-${index + 1}`),
    name: String(row.name || defaultProduct.name),
    nameAr: String(row.nameAr || ''),
    baseName: String(row.baseName || row.name || defaultProduct.baseName || defaultProduct.name),
    baseNameAr: String(row.baseNameAr || ''),
    color: String(row.color || ''),
    colorAr: String(row.colorAr || ''),
    variantGroup: String(row.variantGroup || ''),
    category: String(row.category || defaultProduct.category),
    collection: String(row.collection || defaultProduct.collection),
    collectionAr: String(row.collectionAr || ''),
    price: String(row.price || defaultProduct.price),
    oldPrice: String(row.oldPrice || ''),
    images: images.length ? images : defaultProduct.images,
    shortDescription: String(row.shortDescription || defaultProduct.shortDescription),
    shortDescriptionAr: String(row.shortDescriptionAr || ''),
    features: splitList(row.features).length ? splitList(row.features) : defaultProduct.features,
    featuresAr: splitList(row.featuresAr),
    reasons: splitList(row.reasons),
    reasonsAr: splitList(row.reasonsAr),
    availability: String(
      row.availability ||
        (typeof quantity === 'number'
          ? quantity > 0
            ? 'Disponible'
            : 'Rupture de stock'
          : defaultProduct.availability)
    ),
    availabilityAr: String(row.availabilityAr || ''),
    quantity,
    published,
    featured,
    tags: splitList(row.tags)
  };
};

const extractRows = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];

  if (payload && typeof payload === 'object') {
    const value = payload as { products?: unknown; data?: unknown; items?: unknown };
    if (Array.isArray(value.products)) return value.products as Record<string, unknown>[];
    if (Array.isArray(value.data)) return value.data as Record<string, unknown>[];
    if (Array.isArray(value.items)) return value.items as Record<string, unknown>[];
  }

  return [];
};

const fetchSheetProducts = async () => {
  if (!PRODUCTS_FEED_URL) {
    console.warn('[product-source] PRODUCTS_FEED_URL is missing. Using local fallback products.');
    return null;
  }

  try {
    const requestUrl = new URL(PRODUCTS_FEED_URL);

    if (IS_DEV) {
      requestUrl.searchParams.set('_ts', String(Date.now()));
    }

    console.info(`[product-source] PRODUCTS_FEED_URL=${requestUrl.toString()}`);

    const response = await fetch(requestUrl.toString(), {
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error(
        `[product-source] Feed request failed with status ${response.status} for ${requestUrl.toString()}`
      );
      return null;
    }

    const rawText = await response.text();
    let payload: unknown;

    try {
      payload = JSON.parse(rawText);
    } catch {
      console.error(
        `[product-source] Feed response is not valid JSON for ${requestUrl.toString()}. First 300 chars: ${rawText.slice(0, 300)}`
      );
      return null;
    }

    const payloadKeys =
      payload && typeof payload === 'object'
        ? Object.keys(payload as Record<string, unknown>).join(',')
        : typeof payload;

    console.info(`[product-source] Feed payload keys=${payloadKeys}`);

    const rows = extractRows(payload);
    console.info(`[product-source] Feed rows count=${rows.length}`);

    if (rows.length === 0) {
      const payloadMessage =
        payload && typeof payload === 'object' && 'message' in (payload as Record<string, unknown>)
          ? String((payload as Record<string, unknown>).message || '')
          : '';

      console.warn(
        `[product-source] Feed returned no rows for ${requestUrl.toString()}${
          payloadMessage ? `. Message: ${payloadMessage}` : ''
        }. Using local fallback products.`
      );
      return null;
    }

    const products = rows.map(normalizeProduct);
    const publishedProducts = products.filter((product) => product.published !== false);

    console.info(`[product-source] Loaded ${products.length} total product(s) from sheet feed.`);
    console.info(`[product-source] Loaded ${publishedProducts.length} published product(s) from sheet feed.`);

    return publishedProducts.length ? publishedProducts : null;
  } catch (error) {
    console.error(`[product-source] Feed fetch crashed for ${PRODUCTS_FEED_URL}:`, error);
    return null;
  }
};

export const getProducts = async () => {
  const now = Date.now();
  const isCacheExpired = !cachedProductsAt || now - cachedProductsAt > PRODUCT_CACHE_TTL_MS;

  if (IS_DEV) {
    cachedProductsPromise = null;
    cachedProductsAt = 0;
  }

  if (!cachedProductsPromise || isCacheExpired) {
    cachedProductsPromise = (async () => {
      const sheetProducts = await fetchSheetProducts();
      if (sheetProducts) return sheetProducts;

      console.warn('[product-source] Falling back to local src/data/products.ts dataset.');
      return localProducts;
    })();

    cachedProductsAt = now;
  }

  return cachedProductsPromise;
};

export const getFeaturedProducts = (products: Product[]) =>
  products.filter(
    (product, index, list) => product.featured && index === list.findIndex((item) => item.id === product.id)
  );

export const getCatalogProducts = (products: Product[]) =>
  products.filter((product, index, list) => index === list.findIndex((item) => item.id === product.id));

const hasTag = (product: Product, patterns: string[]) => {
  const haystack = [product.slug, product.category, product.collection, ...product.tags].join(' ').toLowerCase();
  return patterns.some((pattern) => haystack.includes(pattern));
};

export const getProductCategoryKeys = (product: Product) => {
  const categories = new Set<string>();
  const categoryValues = splitCategoryList(product.category);

  categoryValues.forEach((value) => {
    if (value.includes('voiture') || value.includes('car')) categories.add('voiture');
    if (value.includes('beaute') || value.includes('beauty') || value.includes('maquillage')) categories.add('beaute');
    if (value.includes('organisation') || value.includes('organisateur') || value.includes('rangement')) categories.add('organisation');
    if (value.includes('maison') || value.includes('home') || value.includes('accessoires du quotidien')) categories.add('maison');
  });

  if (hasTag(product, ['voiture', 'car'])) categories.add('voiture');
  if (hasTag(product, ['beaute', 'beauty', 'makeup', 'maquillage'])) categories.add('beaute');
  if (hasTag(product, ['organisation', 'organisateur', 'rangement'])) categories.add('organisation');
  if (hasTag(product, ['maison', 'home'])) categories.add('maison');
  if (hasTag(product, ['miroir-lumineux'])) categories.add('voiture');

  return categories.size ? Array.from(categories) : ['maison'];
};

export const getProductCategoryKey = (product: Product) => getProductCategoryKeys(product)[0];

export const getProductCategoryLabel = (product: Product, locale: 'fr' | 'ar' = 'fr') => {
  const labels = {
    fr: {
      maison: 'Maison',
      voiture: 'Voiture',
      organisation: 'Organisation',
      beaute: 'Beaute'
    },
    ar: {
      maison: 'المنزل',
      voiture: 'السيارة',
      organisation: 'التنظيم',
      beaute: 'الجمال'
    }
  };

  return getProductCategoryKeys(product)
    .map((key) => labels[locale][key as keyof (typeof labels)['fr']])
    .join(' / ');
};

export const isPromotionProduct = (product: Product) =>
  Boolean(product.oldPrice) || hasTag(product, ['solde', 'promo', 'promotion', 'reduction']);

export const isNewProduct = (product: Product) => hasTag(product, ['nouveau', 'nouveaute', 'new']);

export const isPopularProduct = (product: Product) =>
  product.featured || hasTag(product, ['tendance', 'best seller', 'bestseller', 'populaire']);

export const getProductBadge = (product: Product, locale: 'fr' | 'ar' = 'fr') => {
  if (isPromotionProduct(product)) {
    return locale === 'ar'
      ? { label: 'تخفيض', tone: 'sale' }
      : { label: 'Solde', tone: 'sale' };
  }

  if (hasTag(product, ['best seller', 'bestseller'])) {
    return locale === 'ar'
      ? { label: '⭐ الأكثر مبيعاً', tone: 'best' }
      : { label: '⭐ Best seller', tone: 'best' };
  }

  if (isPopularProduct(product)) {
    return locale === 'ar'
      ? { label: '🔥 رائج', tone: 'trend' }
      : { label: '🔥 Tendance', tone: 'trend' };
  }

  return null;
};

const uniqueProducts = (products: Product[]) =>
  products.filter((product, index, list) => index === list.findIndex((item) => item.id === product.id));

export const getPromotionProducts = (products: Product[]) => uniqueProducts(products.filter(isPromotionProduct)).slice(0, 4);

export const getNewArrivalProducts = (products: Product[]) => {
  const matches = uniqueProducts(products.filter(isNewProduct));
  return (matches.length ? matches : uniqueProducts(products)).slice(0, 4);
};

export const getPopularProducts = (products: Product[]) => {
  const matches = uniqueProducts(products.filter(isPopularProduct));
  return (matches.length ? matches : uniqueProducts(products)).slice(0, 4);
};

export const getAvailableColors = (
  products: Product[],
  productSlug: string,
  variantGroup?: string,
  locale: 'fr' | 'ar' = 'fr'
) =>
  Array.from(
    new Set(
      products
        .filter((item) => (variantGroup ? item.variantGroup === variantGroup : item.slug === productSlug))
        .flatMap((item) => splitColorList(locale === 'ar' ? item.colorAr || item.color : item.color))
    )
  );

export const getProductColors = (product: Product, locale: 'fr' | 'ar' = 'fr') =>
  splitColorList(locale === 'ar' ? product.colorAr || product.color : product.color);

export const getVariants = (products: Product[], product: Product) =>
  products.filter((item) => (product.variantGroup ? item.variantGroup === product.variantGroup : item.slug === product.slug));

export const getSimilarProducts = (products: Product[], product: Product) =>
  products
    .filter(
      (item) =>
        item.id !== product.id &&
        getProductCategoryKeys(item).some((category) => getProductCategoryKeys(product).includes(category))
    )
    .filter((item, index, list) => index === list.findIndex((entry) => entry.id === item.id))
    .slice(0, 4);