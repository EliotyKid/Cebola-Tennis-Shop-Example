'use client';

import { Button } from '@/components/cb/actions';
import { ProductTile } from '@/components/ProductTile';
import { useStore } from '@/components/StoreProvider';
import type { Product } from '@/lib/types';

export function FavoritesView({ products }: { products: Product[] }) {
  const { favorites, hydrated } = useStore();
  const items = products.filter(p => favorites.includes(p.id));
  return (
    <div className="page">
      <div className="wrap">
        <h1 className="catalog__title">Favoritos</h1>
        {!hydrated ? <div className="cart__pending" /> : items.length ? (
          <div className="catalog__grid catalog__grid--wide">{items.map(p => <ProductTile key={p.id} product={p} />)}</div>
        ) : (
          <div className="cart__empty">
            <h2>Nenhum favorito ainda</h2>
            <p>Toque no coração dos produtos para guardar aqui.</p>
            <Button arrow href="/catalogo">Ver catálogo</Button>
          </div>
        )}
      </div>
    </div>
  );
}
