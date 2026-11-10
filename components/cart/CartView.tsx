'use client';

import { BuyButton } from '@/components/BuyButton';
import { Button } from '@/components/cb/actions';
import { CartItem, OrderSummary } from '@/components/cb/commerce';
import { useStore } from '@/components/StoreProvider';
import { resolveLines } from '@/lib/cart';
import type { Product } from '@/lib/types';

export function CartView({ products }: { products: Product[] }) {
  const { cart, hydrated, setQty, remove } = useStore();
  const lines = resolveLines(cart, products);
  const available = lines.filter(l => l.product.inStock);
  const count = available.reduce((s, l) => s + l.qty, 0);
  const total = available.reduce((s, l) => s + l.qty * l.product.price, 0);
  const items = lines.map(l => ({ name: l.product.name, qty: l.qty, price: l.product.price, attrs: l.attrs, outOfStock: !l.product.inStock }));
  return (
    <div className="page">
      <div className="wrap cart">
        <div className="cart__help">
          <h1>Sacola</h1>
          <span>Ficou com alguma dúvida antes de finalizar? A gente ajuda pelo WhatsApp.</span>
          <span>E-mail: contato@cebolatennis.com.br</span>
        </div>
        <div className="cart__body">
          {!hydrated ? <div className="cart__pending" /> : lines.length === 0 ? (
            <div className="cart__empty">
              <h2>Sua sacola está vazia</h2>
              <p>Que tal começar pelas novidades da semana?</p>
              <Button arrow href="/catalogo">Ver catálogo</Button>
            </div>
          ) : (
            <>
              <div className="cart__lines">
                {lines.map(l => <CartItem key={l.key} image={l.product.images[0]} name={l.product.name} attrs={l.attrs} qty={l.qty} onQty={q => setQty(l.key, q)} price={l.product.price} onRemove={() => remove(l.key)} outOfStock={!l.product.inStock} />)}
              </div>
              <div className="cart__summary">
                <OrderSummary count={count} total={total} note="Frete e pagamento são combinados no atendimento." action={<BuyButton items={items} label={available.length ? 'Comprar' : 'Consultar disponibilidade'} variant="dark" size="lg" block />} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
