import type { Product } from '../lib/types';

export const products: Product[] = [
  {
    id: 'p1',
    slug: 'miroir-lumineux-noir',
    name: 'Miroir Lumineux Noir',
    nameAr: 'مرآة مضيئة سوداء',
    baseName: 'Miroir Lumineux',
    baseNameAr: 'مرآة مضيئة',
    color: 'Noir',
    colorAr: 'اسود',
    variantGroup: 'miroir-lumineux',
    category: 'Accessoires du quotidien',
    collection: 'Luxe Quotidien',
    collectionAr: 'اناقة يومية',
    price: '4 500 DA',
    images: ['/images/products/miroir-lumineux-noir.jpg'],
    shortDescription: 'Un miroir lumineux noir elegant pour illuminer votre espace quotidien.',
    shortDescriptionAr: 'مرآة مضيئة باللون الأسود بتصميم أنيق تضيف لمسة عملية وجمالية إلى مساحتك اليومية.',
    features: ['Eclairage LED integre', 'Design moderne', 'Finition noire elegante', 'Usage quotidien'],
    featuresAr: ['إضاءة LED مدمجة', 'تصميم عصري', 'تشطيب أسود أنيق', 'مناسبة للاستعمال اليومي'],
    availability: 'Disponible',
    availabilityAr: 'متوفر',
    featured: true,
    tags: ['miroir', 'lumineux', 'noir', 'eclairage']
  },
  {
    id: 'p2',
    slug: 'miroir-lumineux-blanc',
    name: 'Miroir Lumineux Blanc',
    nameAr: 'مرآة مضيئة بيضاء',
    baseName: 'Miroir Lumineux',
    baseNameAr: 'مرآة مضيئة',
    color: 'Blanc',
    colorAr: 'ابيض',
    variantGroup: 'miroir-lumineux',
    category: 'Accessoires du quotidien',
    collection: 'Luxe Quotidien',
    collectionAr: 'اناقة يومية',
    price: '4 500 DA',
    images: ['/images/products/miroir-lumineux-blanc.jpg'],
    shortDescription: 'Un miroir lumineux blanc raffine pour apporter clarte a votre routine.',
    shortDescriptionAr: 'مرآة مضيئة باللون الأبيض بلمسة راقية تمنح روتينك اليومي وضوحا وأناقة.',
    features: ['Eclairage LED integre', 'Design epure', 'Finition blanche elegante', 'Usage quotidien'],
    featuresAr: ['إضاءة LED مدمجة', 'تصميم ناعم', 'تشطيب أبيض أنيق', 'مناسبة للاستعمال اليومي'],
    availability: 'Disponible',
    availabilityAr: 'متوفر',
    featured: true,
    tags: ['miroir', 'lumineux', 'blanc', 'eclairage']
  }
];

export const featuredProducts = products.filter(
  (product, index, list) =>
    product.featured &&
    index === list.findIndex((item) => (item.variantGroup || item.slug) === (product.variantGroup || product.slug))
);
