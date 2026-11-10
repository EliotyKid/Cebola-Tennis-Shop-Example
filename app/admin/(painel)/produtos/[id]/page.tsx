import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import { loadAdminCategories, loadAdminProduct } from '@/lib/admin/queries';
import { toFormValues } from '@/lib/admin/validation';

export const metadata: Metadata = { title: 'Editar produto' };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [loaded, categories] = await Promise.all([loadAdminProduct(id), loadAdminCategories()]);
  if (!loaded) notFound();
  return <ProductForm key={loaded.updatedAt} initial={toFormValues(loaded.product)} categories={categories} id={id} updatedAt={loaded.updatedAt} />;
}
