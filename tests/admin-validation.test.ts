import { describe, expect, it } from 'vitest';
import { formatBrlInput, parseBrl, parseCategoryInput, parseProductInput, slugify } from '@/lib/admin/validation';

const valid = {
  name: 'Raquete Pro', slug: '', brand: 'Wilson', categoryId: 'raquetes', price: '1.599,90', oldPrice: '',
  images: ['/a.webp'], badgeLabel: '', badgeTone: 'lime', description: 'Boa', options: [], sku: '',
  featured: false, isNew: false, inStock: true,
};
const fields = (raw: unknown) => {
  const r = parseProductInput(raw);
  return r.ok ? {} : r.fields;
};

describe('slugify', () => {
  it('removes accents and punctuation', () => {
    expect(slugify('Raquete Pró – Ação 97')).toBe('raquete-pro-acao-97');
  });
});

describe('parseBrl', () => {
  it.each([['1.599,90', 1599.9], ['1599.9', 1599.9], ['89', 89], ['R$ 1.599,90', 1599.9], ['1.599', 1599], ['0,5', 0.5]])('reads %s', (input, n) => {
    expect(parseBrl(input)).toBe(n);
  });
  it.each(['abc', '', '-1', '1,2,3', '1.5.5', '1,999', '100000000'])('rejects %s', input => {
    expect(parseBrl(input)).toBeNull();
  });
  it('round-trips with the form format', () => {
    expect(parseBrl(formatBrlInput(1599.9))).toBe(1599.9);
    expect(formatBrlInput(89)).toBe('89,00');
  });
});

describe('parseProductInput', () => {
  it('accepts a valid product and derives the slug from the name', () => {
    const r = parseProductInput(valid);
    expect(r.ok && r.value).toMatchObject({ slug: 'raquete-pro', price: 1599.9, oldPrice: null, badge: null, sku: null, inStock: true });
  });
  it.each(['name', 'brand', 'categoryId', 'price', 'description'])('requires %s', field => {
    expect(fields({ ...valid, [field]: '  ' })).toHaveProperty(field);
  });
  it('requires an image', () => {
    expect(fields({ ...valid, images: [] })).toHaveProperty('images');
  });
  it('requires old price above price', () => {
    expect(fields({ ...valid, oldPrice: '1.599,90' })).toHaveProperty('oldPrice');
    expect(fields({ ...valid, oldPrice: '1.699,90' })).toEqual({});
  });
  it('rejects an option without values', () => {
    expect(fields({ ...valid, options: [{ label: 'Grip', values: [' '] }] })).toHaveProperty('options');
  });
  it('trims options and drops blank values', () => {
    const r = parseProductInput({ ...valid, options: [{ label: ' Grip ', values: ['L1 ', '', 'L2'] }] });
    expect(r.ok && r.value.options).toEqual([{ label: 'Grip', values: ['L1', 'L2'] }]);
  });
  it('rejects a name that yields no slug', () => {
    expect(fields({ ...valid, name: '!!!' })).toHaveProperty('slug');
  });
  it('survives a malformed payload', () => {
    expect(parseProductInput(null).ok).toBe(false);
    expect(parseProductInput({ images: 'x', options: 3 }).ok).toBe(false);
  });
  it('ignores an unknown badge tone', () => {
    const r = parseProductInput({ ...valid, badgeLabel: 'Novo', badgeTone: 'hacker' });
    expect(r.ok && r.value.badge).toEqual({ label: 'Novo', tone: 'lime' });
  });
});

describe('parseCategoryInput', () => {
  it('requires label and image', () => {
    const r = parseCategoryInput({ label: '', image: '' });
    expect(!r.ok && Object.keys(r.fields).sort()).toEqual(['image', 'label']);
  });
  it('accepts a valid category', () => {
    expect(parseCategoryInput({ label: ' Bolas ', image: '/a.webp' })).toEqual({ ok: true, value: { label: 'Bolas', image: '/a.webp' } });
  });
});
