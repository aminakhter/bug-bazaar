import { Product, ProductCategory } from '../types/api';

const CATEGORIES: ProductCategory[] = ['keyboards', 'ducks', 'coffee', 'stickers'];

const ADJECTIVES = [
  'Tactile',
  'Async',
  'Recursive',
  'Zero-Latency',
  'Quantum',
  'Mechanical',
  'Rubber',
  'Debug',
  'Midnight',
  'Overclocked',
];

const NOUNS: Record<ProductCategory, string[]> = {
  keyboards: ['65% Custom Kit', 'Linear Switch Pack', 'Split Ergo Board', 'Artisan Keycap'],
  ducks: ['Stack-Trace Duck', 'Captain Segfault Duck', 'Senior Architect Duck', 'Pair-Coder Duck'],
  coffee: ['Dark Roast Espresso', 'Cold Brew Concentrate', 'Infinite Loop Beans', 'Kernel Panic Blend'],
  stickers: ['Git Force-Push Hologram', 'Works On My Machine', 'TypeScript Strict Badge', 'VIM Exit Guide'],
};

function generateSeedProducts(count: number): Product[] {
  const products: Product[] = [];

  for (let i = 1; i <= count; i++) {
    const category = CATEGORIES[(i - 1) % CATEGORIES.length] ?? 'ducks';
    const adj = ADJECTIVES[i % ADJECTIVES.length] ?? 'Debug';
    const nounList = NOUNS[category];
    const noun = nounList[i % nounList.length] ?? 'Edition';

    // Deterministic stock: ~10% out of stock (0), rest 1..45
    const stock = i % 10 === 0 ? 0 : ((i * 7) % 45) + 1;
    // Price in cents: $4.99 to $249.99
    const price = ((i * 37) % 24500) + 499;
    // Rating between 3.0 and 5.0
    const rating = Number((3 + ((i * 13) % 21) / 10).toFixed(1));

    const name =
      i === 1
        ? 'Async Linear Switch Pack #1'
        : i === 2
          ? 'Recursive Captain Segfault Duck #2'
          : `${adj} ${noun} #${i}`;

    products.push({
      id: `prod-${String(i).padStart(4, '0')}`,
      name,
      price,
      category,
      stock,
      rating,
      imageUrl: `https://picsum.photos/seed/bugbazaar-${i}/400/300`,
    });
  }

  return products;
}

export const mockProductStore: Product[] = generateSeedProducts(5000);