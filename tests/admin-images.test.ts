import { describe, expect, it } from 'vitest';
import { filterAdminProducts } from '@/lib/admin/list';
import { MAX_IMAGE_BYTES, moveItem, unusedStoragePaths, validateImageFile } from '@/lib/admin/images';
import type { Product } from '@/lib/types';

const base = 'https://x.supabase.co/storage/v1/object/public/catalog/';

describe('unusedStoragePaths', () => {
  it('returns only bucket files that left the list', () => {
    expect(unusedStoragePaths([`${base}a.webp`, `${base}b.webp`, '/sample/c.jpg'], [`${base}b.webp`], base)).toEqual(['a.webp']);
  });
});

describe('validateImageFile', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp'])('accepts %s', type => {
    expect(validateImageFile({ type, size: MAX_IMAGE_BYTES })).toBeNull();
  });
  it('rejects other formats', () => {
    expect(validateImageFile({ type: 'image/gif', size: 10 })).toMatch(/JPEG, PNG ou WebP/);
  });
  it('rejects files over the limit', () => {
    expect(validateImageFile({ type: 'image/png', size: MAX_IMAGE_BYTES + 1 })).toMatch(/10 MB/);
  });
});

describe('moveItem', () => {
  it('moves an item', () => {
    expect(moveItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });
  it('ignores moves outside the list', () => {
    expect(moveItem(['a', 'b'], 0, -1)).toEqual(['a', 'b']);
    expect(moveItem(['a', 'b'], 1, 2)).toEqual(['a', 'b']);
  });
});

describe('filterAdminProducts', () => {
  const make = (id: string, extra: Partial<Product>): Product => ({
    id, slug: id, name: 'x', brand: 'y', categoryId: 'a', price: 1, images: [], description: '', options: [], inStock: true, ...extra,
  });
  const list = [make('1', { name: 'Calção Ação' }), make('2', { brand: 'Wilson', categoryId: 'b' }), make('3', { sku: 'AB-12' })];
  const ids = (q: string, c = '') => filterAdminProducts(list, q, c).map(p => p.id);
  it('ignores accents and case', () => expect(ids('ACAO')).toEqual(['1']));
  it('searches brand and SKU', () => {
    expect(ids('wilson')).toEqual(['2']);
    expect(ids('ab-12')).toEqual(['3']);
  });
  it('combines search and category', () => {
    expect(ids('', 'b')).toEqual(['2']);
    expect(ids('wilson', 'a')).toEqual([]);
  });
});
