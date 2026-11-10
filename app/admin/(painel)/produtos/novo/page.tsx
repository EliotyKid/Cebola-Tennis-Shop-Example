import type { Metadata } from 'next';
import { ProductForm } from '@/components/admin/ProductForm';
import { loadAdminCategories } from '@/lib/admin/queries';

export const metadata: Metadata = { title: 'Novo produto' };

const EMPTY = {
  name: '', slug: '', brand: '', categoryId: '', price: '', oldPrice: '', images: [], badgeLabel: '', badgeTone: 'lime',
  description: '', options: [], sku: '', featured: false, isNew: false, inStock: true,
};

export default async function NewProductPage() {
  return <ProductForm initial={EMPTY} categories={await loadAdminCategories()} />;
}
