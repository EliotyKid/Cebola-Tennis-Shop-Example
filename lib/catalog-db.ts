import type { Category, Product, ProductOption } from './types';

export const CATALOG_TAG = 'catalog';

export type CategoryRow = { id: string; slug: string; label: string; image: string; position: number };

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category_id: string;
  // Postgres numeric may arrive as a string.
  price: number | string;
  old_price: number | string | null;
  images: string[];
  badge: Product['badge'] | null;
  description: string;
  options: ProductOption[];
  sku: string | null;
  featured: boolean;
  is_new: boolean;
  in_stock: boolean;
  updated_at: string;
};

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    categoryId: row.category_id,
    price: Number(row.price),
    ...(row.old_price === null ? {} : { oldPrice: Number(row.old_price) }),
    images: row.images,
    ...(row.badge ? { badge: row.badge } : {}),
    description: row.description,
    options: row.options,
    ...(row.sku ? { sku: row.sku } : {}),
    featured: row.featured,
    isNew: row.is_new,
    inStock: row.in_stock,
  };
}

export const toCategory = ({ id, slug, label, image }: CategoryRow): Category => ({ id, slug, label, image });
