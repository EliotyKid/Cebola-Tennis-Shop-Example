'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { addLine, parseStored, sanitizeLines, type CartAttr, type CartLine } from '@/lib/cart';

const CART_KEY = 'cebola-cart';
const FAVORITES_KEY = 'cebola-favorites';

type Store = {
  cart: CartLine[];
  favorites: string[];
  hydrated: boolean;
  toast: string | null;
  addToCart(id: string, name: string, qty: number, attrs: CartAttr[]): void;
  setQty(key: string, qty: number): void;
  remove(key: string): void;
  toggleFavorite(id: string): void;
};

const StoreContext = createContext<Store | null>(null);

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or full storage: the store keeps working for this visit.
  }
};

export function StoreProvider({ productIds, children }: { productIds: string[]; children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // Items that left the catalog are dropped here so badges and lists agree.
    const known = new Set(productIds);
    const loadCart = () => setCart(sanitizeLines(parseStored<unknown>(read(CART_KEY), [])).filter(l => known.has(l.id)));
    const loadFavorites = () => setFavorites(parseStored<string[]>(read(FAVORITES_KEY), []).filter(id => known.has(id)));
    loadCart();
    loadFavorites();
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) loadCart();
      if (e.key === FAVORITES_KEY) loadFavorites();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [productIds]);

  useEffect(() => { if (hydrated) write(CART_KEY, cart); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) write(FAVORITES_KEY, favorites); }, [favorites, hydrated]);

  const store: Store = {
    cart,
    favorites,
    hydrated,
    toast,
    addToCart(id, name, qty, attrs) {
      setCart(c => addLine(c, id, qty, attrs));
      setToast(name.length > 30 ? `${name.slice(0, 30)}…` : name);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 2600);
    },
    setQty: (key, qty) => setCart(c => c.map(l => (l.key === key ? { ...l, qty } : l))),
    remove: key => setCart(c => c.filter(l => l.key !== key)),
    toggleFavorite: id => setFavorites(f => (f.includes(id) ? f.filter(x => x !== id) : [...f, id])),
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}
