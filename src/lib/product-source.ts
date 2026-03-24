import { products as localProducts } from '../data/products';
import type { Product } from './types';

const PRODUCTS_FEED_URL = import.meta.env.PRODUCTS_FEED_URL || import.meta.env.PUBLIC_PRODUCTS_FEED_URL || '';

const defaultProduct: Product = localProducts[0];
let cachedProductsPromise: Promise<Product[]> | null = null;

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
    availability: String(
      row.availability || (typeof quantity === 'number' ? (quantity > 0 ? 'Disponible' : 'Rupture de stock') : defaultProduct.availability)
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
  if (!PRODUCTS_FEED_URL) return null;

  try {
    const response = await fetch(PRODUCTS_FEED_URL, {
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) return null;

    const payload = await response.json();
    const rows = extractRows(payload);
    const products = rows.map(normalizeProduct).filter((product) => product.published !== false);

    return products.length ? products : null;
  } catch {
    return null;
  }
};

export const getProducts = async () => {
  if (!cachedProductsPromise) {
    cachedProductsPromise = (async () => {
      const sheetProducts = await fetchSheetProducts();
      return sheetProducts || localProducts;
    })();
  }

  return cachedProductsPromise;
};

export const getFeaturedProducts = (products: Product[]) =>
  products.filter(
    (product, index, list) =>
      product.featured &&
      index === list.findIndex((item) => (item.variantGroup || item.slug) === (product.variantGroup || product.slug))
  );

export const getCatalogProducts = (products: Product[]) =>
  products.filter(
    (product, index, list) =>
      index === list.findIndex((item) => (item.variantGroup || item.slug) === (product.variantGroup || product.slug))
  );

export const getAvailableColors = (products: Product[], productSlug: string, variantGroup?: string, locale: 'fr' | 'ar' = 'fr') =>
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
        item.category === product.category &&
        item.slug !== product.slug &&
        item.variantGroup !== product.variantGroup
    )
    .filter(
      (item, index, list) =>
        index === list.findIndex((entry) => (entry.variantGroup || entry.slug) === (item.variantGroup || item.slug))
    )
    .slice(0, 4);
