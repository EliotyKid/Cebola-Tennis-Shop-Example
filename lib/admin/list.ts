import type { Product } from '@/lib/types';

const normalize = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export function filterAdminProducts(products: Product[], q: string, categoryId: string): Product[] {
  const term = normalize(q.trim());
  return products.filter(p =>
    (!categoryId || p.categoryId === categoryId)
    && (!term || normalize(`${p.name} ${p.brand} ${p.sku ?? ''}`).includes(term)));
}
