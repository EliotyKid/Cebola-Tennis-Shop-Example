import { describe, expect, it } from 'vitest';
import { PAGE_SIZE, applyCatalogQuery, parseCatalogQuery } from '@/lib/catalog';
import catalog from '@/data/catalog.json';
import type { CatalogQuery, Product } from '@/lib/types';

const make = (i: number, extra: Partial<Product> = {}): Product => ({
  id: `p${i}`, slug: `p${i}`, name: `Produto ${i}`, brand: 'Wilson', categoryId: 'raquetes',
  price: 100 + i, images: ['/x.jpg'], description: 'd', options: [], inStock: true, ...extra,
});
const base: CatalogQuery = { brands: [], onSale: false, isNew: false, sort: 'relevancia', page: 1 };
const many = Array.from({ length: 30 }, (_, i) => make(i));

describe('parseCatalogQuery', () => {
  it('falls back on invalid numbers', () => {
    const q = parseCatalogQuery({ page: 'abc', min: 'x' });
    expect(q.page).toBe(1);
    expect(q.min).toBeUndefined();
  });
  it('falls back on an unknown sort', () => {
    expect(parseCatalogQuery({ sort: 'foo' }).sort).toBe('relevancia');
  });
  it('accepts one or many brands', () => {
    expect(parseCatalogQuery({ marca: 'Nike' }).brands).toEqual(['Nike']);
    expect(parseCatalogQuery({ marca: ['Nike', 'Head'] }).brands).toEqual(['Nike', 'Head']);
  });
  it('reads the flags', () => {
    const q = parseCatalogQuery({ promocao: '1', novo: '1' });
    expect([q.onSale, q.isNew]).toEqual([true, true]);
  });
});

describe('applyCatalogQuery', () => {
  it('returns one page of items', () => {
    const r = applyCatalogQuery(many, base);
    expect(r.items).toHaveLength(PAGE_SIZE);
    expect(r.total).toBe(30);
    expect(r.pageCount).toBe(3);
  });
  it('clamps a page past the end to the last page', () => {
    const r = applyCatalogQuery(many, { ...base, page: 999 });
    expect(r.page).toBe(3);
    expect(r.items).toHaveLength(6);
  });
  it('filters by brand', () => {
    const r = applyCatalogQuery([make(1), make(2, { brand: 'Head' })], { ...base, brands: ['Head'] });
    expect(r.items.map(p => p.id)).toEqual(['p2']);
  });
  it('filters sale items', () => {
    const r = applyCatalogQuery([make(1), make(2, { oldPrice: 500 })], { ...base, onSale: true });
    expect(r.items.map(p => p.id)).toEqual(['p2']);
  });
  it('filters by price range', () => {
    const r = applyCatalogQuery([make(1), make(50), make(99)], { ...base, min: 120, max: 160 });
    expect(r.items.map(p => p.id)).toEqual(['p50']);
  });
  it('sorts by lowest and highest price', () => {
    const list = [make(5), make(1), make(9)];
    expect(applyCatalogQuery(list, { ...base, sort: 'menor-preco' }).items.map(p => p.id)).toEqual(['p1', 'p5', 'p9']);
    expect(applyCatalogQuery(list, { ...base, sort: 'maior-preco' }).items.map(p => p.id)).toEqual(['p9', 'p5', 'p1']);
  });
  it('handles an empty result', () => {
    const r = applyCatalogQuery([], base);
    expect(r).toMatchObject({ items: [], total: 0, page: 1, pageCount: 1 });
  });
});

describe('sample catalog integrity', () => {
  const { categories, products } = catalog;
  it('keeps slugs unique', () => {
    expect(new Set(products.map(p => p.slug)).size).toBe(products.length);
  });
  it('points every product to an existing category and an image', () => {
    const ids = new Set(categories.map(c => c.id));
    for (const p of products) {
      expect(ids.has(p.categoryId)).toBe(true);
      expect(p.images.length).toBeGreaterThan(0);
    }
  });
  it('has at least one product in every category', () => {
    for (const c of categories) expect(products.some(p => p.categoryId === c.id)).toBe(true);
  });
  it('has at least 30 products', () => {
    expect(products.length).toBeGreaterThanOrEqual(30);
  });
});
