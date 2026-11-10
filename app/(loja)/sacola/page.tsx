import type { Metadata } from 'next';
import { CartView } from '@/components/cart/CartView';
import { getProducts } from '@/lib/catalog';

export const metadata: Metadata = { title: 'Sacola', robots: { index: false } };

export default async function BagPage() {
  return <CartView products={await getProducts()} />;
}
