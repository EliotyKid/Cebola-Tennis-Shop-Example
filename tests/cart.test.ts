import { describe, expect, it } from 'vitest';
import { addLine, parseStored, resolveLines, sanitizeLines } from '@/lib/cart';
import type { Product } from '@/lib/types';

const grip = (v: string) => [{ label: 'Grip', value: v }];
const product = { id: 'a', slug: 'a', name: 'A', brand: 'B', categoryId: 'c', price: 10, images: [], description: '', options: [], inStock: true } as Product;

describe('addLine', () => {
  it('sums quantity for the same options', () => {
    const lines = addLine(addLine([], 'a', 1, grip('L2')), 'a', 2, grip('L2'));
    expect(lines).toHaveLength(1);
    expect(lines[0].qty).toBe(3);
  });
  it('creates a new line for different options', () => {
    expect(addLine(addLine([], 'a', 1, grip('L2')), 'a', 1, grip('L3'))).toHaveLength(2);
  });
});

describe('parseStored', () => {
  it('falls back on corrupted JSON', () => {
    expect(parseStored('{quebrado', [])).toEqual([]);
  });
  it('falls back on null', () => {
    expect(parseStored(null, [])).toEqual([]);
  });
  it('falls back when the shape differs from an array fallback', () => {
    expect(parseStored('{"a":1}', [])).toEqual([]);
  });
  it('returns valid stored data', () => {
    expect(parseStored('["a"]', [] as string[])).toEqual(['a']);
  });
});

describe('resolveLines', () => {
  it('drops lines whose product left the catalog', () => {
    const lines = [...addLine([], 'a', 1, []), ...addLine([], 'gone', 1, [])];
    const resolved = resolveLines(lines, [product]);
    expect(resolved.map(l => l.id)).toEqual(['a']);
    expect(resolved[0].product.price).toBe(10);
  });
});

describe('sanitizeLines', () => {
  const valid = { key: 'a|L2', id: 'a', qty: 2, attrs: [{ label: 'Grip', value: 'L2' }] };
  it('keeps valid lines', () => {
    expect(sanitizeLines([valid])).toEqual([valid]);
  });
  it('drops malformed entries', () => {
    expect(sanitizeLines([null, 1, { id: 'a' }, { ...valid, attrs: null }, { ...valid, attrs: [null] }])).toEqual([]);
  });
  it('drops invalid quantities', () => {
    expect(sanitizeLines([{ ...valid, qty: '2' }, { ...valid, qty: -1 }, { ...valid, qty: 1.5 }, { ...valid, qty: 100 }])).toEqual([]);
  });
  it('returns an empty list for non-arrays', () => {
    expect(sanitizeLines({ a: 1 })).toEqual([]);
  });
});

describe('addLine limits', () => {
  it('caps the quantity at 99', () => {
    expect(addLine(addLine([], 'a', 99, []), 'a', 99, [])[0].qty).toBe(99);
  });
});
