import type { Metadata } from 'next';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { loadAdminCategories, loadAdminProducts } from '@/lib/admin/queries';

export const metadata: Metadata = { title: 'Categorias' };

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([loadAdminCategories(), loadAdminProducts()]);
  return <CategoryManager categories={categories.map(c => ({ ...c, count: products.filter(p => p.categoryId === c.id).length }))} />;
}
