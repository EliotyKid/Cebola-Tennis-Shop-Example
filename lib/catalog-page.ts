import { applyCatalogQuery, getCategories, getProducts, parseCatalogQuery } from './catalog';
import type { Category, Product } from './types';

export type RawSearch = Record<string, string | string[] | undefined>;

export async function loadCatalog(raw: RawSearch, category?: Category) {
  const [all, categories] = await Promise.all([getProducts(), getCategories()]);
  const scope: Product[] = category ? all.filter(p => p.categoryId === category.id) : all;
  const query = parseCatalogQuery(raw);
  return {
    ...applyCatalogQuery(scope, query),
    query,
    categories,
    brands: [...new Set(scope.map(p => p.brand))].sort(),
    priceMax: Math.ceil(Math.max(...scope.map(p => p.price), 50) / 50) * 50,
  };
}
