import { unstable_cache } from 'next/cache';
import { CATALOG_TAG, toCategory, toProduct, type CategoryRow, type ProductRow } from './catalog-db';
import { createPublicSupabase } from './supabase/public';
import type { CatalogQuery, Category, Product } from './types';

// The only module the store reads catalog data through. The admin expires this cache on every write.
const loadData = unstable_cache(async () => {
  const supabase = createPublicSupabase();
  const [categories, products] = await Promise.all([
    supabase.from('categories').select('*').order('position').order('label').returns<CategoryRow[]>(),
    supabase.from('products').select('*').order('created_at').order('id').returns<ProductRow[]>(),
  ]);
  if (categories.error) throw new Error(`Could not load categories: ${categories.error.message}`);
  if (products.error) throw new Error(`Could not load products: ${products.error.message}`);
  return { categories: categories.data.map(toCategory), products: products.data.map(toProduct) };
}, ['catalog'], { tags: [CATALOG_TAG] });

export const PAGE_SIZE = 12;

type RawQuery = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const toPrice = (v: string | string[] | undefined) => {
  const raw = first(v);
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function parseCatalogQuery(raw: RawQuery): CatalogQuery {
  const page = Number(first(raw.page));
  const sort = first(raw.sort);
  return {
    brands: raw.marca === undefined ? [] : [raw.marca].flat(),
    onSale: first(raw.promocao) === '1',
    isNew: first(raw.novo) === '1',
    min: toPrice(raw.min),
    max: toPrice(raw.max),
    sort: sort === 'menor-preco' || sort === 'maior-preco' ? sort : 'relevancia',
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
}

export function applyCatalogQuery(products: Product[], query: CatalogQuery) {
  const filtered = products.filter(p =>
    (query.brands.length === 0 || query.brands.includes(p.brand))
    && (!query.onSale || p.oldPrice !== undefined)
    && (!query.isNew || p.isNew === true)
    && (query.min === undefined || p.price >= query.min)
    && (query.max === undefined || p.price <= query.max));
  if (query.sort === 'menor-preco') filtered.sort((a, b) => a.price - b.price);
  if (query.sort === 'maior-preco') filtered.sort((a, b) => b.price - a.price);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  return {
    items: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: filtered.length,
    page,
    pageCount,
  };
}

export async function getCategories(): Promise<(Category & { count: number })[]> {
  const data = await loadData();
  return data.categories.map(c => ({
    ...c,
    count: data.products.filter(p => p.categoryId === c.id).length,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return (await loadData()).categories.find(c => c.slug === slug) ?? null;
}

export async function getProducts(): Promise<Product[]> {
  return (await loadData()).products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return (await loadData()).products.find(p => p.slug === slug) ?? null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const { products } = await loadData();
  return ids.flatMap(id => products.find(p => p.id === id) ?? []);
}

export async function getRelated(product: Product, limit = 5): Promise<Product[]> {
  const others = (await loadData()).products.filter(p => p.id !== product.id);
  const same = others.filter(p => p.categoryId === product.categoryId);
  const rest = others.filter(p => p.categoryId !== product.categoryId);
  return [...same, ...rest].slice(0, limit);
}
