import type { Product } from '../lib/types';

export const products: Product[] = [
  {
    id: 'p1',
    slug: 'miroir-lumineux-noir',
    name: 'Miroir Lumineux Noir',
    category: 'Accessoires du quotidien',
    collection: 'Luxe Quotidien',
    price: '4 500 DA',
    images: ['/images/products/miroir-lumineux-noir.jpg'],
    shortDescription: 'Un miroir lumineux noir elegant pour illuminer votre espace quotidien.',
    features: ['Eclairage LED integre', 'Design moderne', 'Finition noire elegante', 'Usage quotidien'],
    availability: 'Disponible',
    featured: true,
    tags: ['miroir', 'lumineux', 'noir', 'eclairage']
  },
  {
    id: 'p2',
    slug: 'miroir-lumineux-blanc',
    name: 'Miroir Lumineux Blanc',
    category: 'Accessoires du quotidien',
    collection: 'Luxe Quotidien',
    price: '4 500 DA',
    images: ['/images/products/miroir-lumineux-blanc.jpg'],
    shortDescription: 'Un miroir lumineux blanc raffine pour apporter clarte a votre routine.',
    features: ['Eclairage LED integre', 'Design epure', 'Finition blanche elegante', 'Usage quotidien'],
    availability: 'Disponible',
    featured: true,
    tags: ['miroir', 'lumineux', 'blanc', 'eclairage']
  }
];

export const featuredProducts = products.filter((product) => product.featured);
