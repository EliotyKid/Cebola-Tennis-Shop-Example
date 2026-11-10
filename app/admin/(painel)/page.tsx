import type { Metadata } from 'next';
import { ProductList } from '@/components/admin/ProductList';
import { loadAdminCategories, loadAdminProducts } from '@/lib/admin/queries';

export const metadata: Metadata = { title: 'Produtos' };

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ salvo?: string }> }) {
  const [products, categories, { salvo }] = await Promise.all([loadAdminProducts(), loadAdminCategories(), searchParams]);
  return <ProductList products={products} categories={categories} saved={salvo === '1'} />;
}
