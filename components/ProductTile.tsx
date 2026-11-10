'use client';

import { installments } from '@/lib/format';
import type { Product } from '@/lib/types';
import { ProductCard } from './cb/commerce';
import { useStore } from './StoreProvider';

export function ProductTile({ product: p, className }: { product: Product; className?: string }) {
  const { favorites, toggleFavorite, addToCart } = useStore();
  const defaults = p.options.map(o => ({ label: o.label, value: o.values[0] }));
  return (
    <ProductCard
      href={`/produto/${p.slug}`}
      image={p.images[0]}
      name={p.name}
      brand={p.brand}
      price={p.price}
      oldPrice={p.oldPrice}
      badge={p.inStock ? p.badge : { label: 'Fora de estoque', tone: 'dark' }}
      installments={p.price > 500 ? installments(p.price) : undefined}
      favorite={favorites.includes(p.id)}
      onFavorite={() => toggleFavorite(p.id)}
      onQuickAdd={p.inStock ? () => addToCart(p.id, p.name, 1, defaults) : undefined}
      className={className}
    />
  );
}
