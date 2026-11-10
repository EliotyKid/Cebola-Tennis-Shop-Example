import { describe, expect, it } from 'vitest';
import { toCategory, toProduct, type ProductRow } from '@/lib/catalog-db';

const row: ProductRow = {
  id: 'p1', slug: 'p-1', name: 'Raquete', brand: 'Wilson', category_id: 'raquetes', price: '1599.90', old_price: null,
  images: ['/a.jpg'], badge: null, description: 'd', options: [{ label: 'Grip', values: ['L1'] }], sku: null,
  featured: false, is_new: true, in_stock: false, updated_at: '2026-11-09T10:00:00.123456+00:00',
};

describe('toProduct', () => {
  it('converts the database row to the store shape', () => {
    expect(toProduct(row)).toEqual({
      id: 'p1', slug: 'p-1', name: 'Raquete', brand: 'Wilson', categoryId: 'raquetes', price: 1599.9,
      images: ['/a.jpg'], description: 'd', options: [{ label: 'Grip', values: ['L1'] }],
      featured: false, isNew: true, inStock: false,
    });
  });
  it('drops null optional fields instead of keeping null', () => {
    const p = toProduct(row);
    expect('oldPrice' in p).toBe(false);
    expect('badge' in p).toBe(false);
    expect('sku' in p).toBe(false);
  });
  it('keeps optional fields that are set', () => {
    const p = toProduct({ ...row, old_price: 1799.5, badge: { label: 'Novo' }, sku: 'X1' });
    expect(p).toMatchObject({ oldPrice: 1799.5, badge: { label: 'Novo' }, sku: 'X1' });
  });
});

describe('toCategory', () => {
  it('keeps only the store fields', () => {
    expect(toCategory({ id: 'c', slug: 's', label: 'L', image: '/i.jpg', position: 3 })).toEqual({ id: 'c', slug: 's', label: 'L', image: '/i.jpg' });
  });
});
