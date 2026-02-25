import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Minimalist Oak Chair',
    price: 450,
    category: 'Furniture',
    images: [
      'https://picsum.photos/seed/chair1/800/1000',
      'https://picsum.photos/seed/chair1-2/800/1000'
    ],
    description: 'A timeless piece crafted from solid white oak with a natural oil finish. Perfect for any modern living space.',
    externalLink: 'https://www.aliexpress.com',
  },
  {
    id: '2',
    name: 'Ceramic Pendant Light',
    price: 280,
    category: 'Lighting',
    images: [
      'https://picsum.photos/seed/lamp1/800/1000',
      'https://picsum.photos/seed/lamp1-2/800/1000'
    ],
    description: 'Hand-thrown ceramic shade with brass hardware and a woven textile cord. Provides warm, ambient lighting.',
    externalLink: 'https://www.shopify.com',
  },
  {
    id: '3',
    name: 'Linen Throw Pillow',
    price: 85,
    category: 'Textiles',
    images: [
      'https://picsum.photos/seed/pillow1/800/1000'
    ],
    description: 'Soft, stone-washed linen cover with a premium duck down insert. Adds comfort and style to your sofa.',
    externalLink: 'https://www.aliexpress.com',
  },
  {
    id: '4',
    name: 'Abstract Glass Vase',
    price: 120,
    category: 'Accessories',
    images: [
      'https://picsum.photos/seed/vase1/800/1000'
    ],
    description: 'Mouth-blown glass with a unique organic shape and subtle amber tint. A beautiful centerpiece.',
    externalLink: 'https://www.shopify.com',
  },
  {
    id: '5',
    name: 'Walnut Side Table',
    price: 320,
    category: 'Furniture',
    images: [
      'https://picsum.photos/seed/table1/800/1000'
    ],
    description: 'Compact and versatile side table featuring a slim profile and tapered legs. Crafted from solid walnut.',
    externalLink: 'https://www.aliexpress.com',
  },
  {
    id: '6',
    name: 'Brass Desk Lamp',
    price: 195,
    category: 'Lighting',
    images: [
      'https://picsum.photos/seed/lamp2/800/1000'
    ],
    description: 'Adjustable task lighting with a solid brass base and matte black finish. Ideal for your workspace.',
    externalLink: 'https://www.shopify.com',
  },
];
