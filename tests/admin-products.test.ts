import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { guardedDeleteCategory, guardedSaveCategory } from '@/lib/admin/categories';
import { guardedDeleteProduct, guardedSaveProduct, saveProduct } from '@/lib/admin/products';
import type { ProductInput } from '@/lib/admin/validation';

type Result = { data: unknown; error: { code: string; message: string } | null; count?: number };

// Records the query chain and answers each awaited query with the next queued result.
function fakeClient({ results = [], user = 'u1' }: { results?: Result[]; user?: string | null }) {
  const eq: [string, unknown][] = [];
  const from = vi.fn(() => {
    const chain: Record<string, unknown> = {};
    for (const m of ['select', 'insert', 'update', 'delete', 'single', 'maybeSingle']) chain[m] = () => chain;
    chain.eq = (col: string, value: unknown) => { eq.push([col, value]); return chain; };
    chain.then = (ok: (r: Result) => void) => ok(results.shift() ?? { data: [], error: null });
    return chain;
  });
  const remove = vi.fn(async () => ({ error: null }));
  const client = {
    from,
    storage: { from: () => ({ remove }) },
    auth: { getClaims: async () => ({ data: user ? { claims: { sub: user } } : null, error: null }) },
  } as unknown as SupabaseClient;
  return { client, from, eq, remove };
}

const input: ProductInput = {
  slug: 's', name: 'n', brand: 'b', categoryId: 'c', price: 10, oldPrice: null, images: ['/a'], badge: null,
  description: 'd', options: [], sku: null, featured: false, isNew: false, inStock: true,
};
const raw = {
  name: 'n', slug: 's', brand: 'b', categoryId: 'c', price: '10', oldPrice: '', images: ['/a'], badgeLabel: '', badgeTone: 'lime',
  description: 'd', options: [], sku: '', featured: false, isNew: false, inStock: true,
};

describe('saveProduct', () => {
  it('only updates the version the employee loaded', async () => {
    const { client, eq } = fakeClient({ results: [{ data: [{ id: 'p1' }], error: null }] });
    expect(await saveProduct(client, input, 'p1', '2026-11-09T10:00:00.123456+00:00')).toEqual({ ok: true, id: 'p1' });
    expect(eq).toContainEqual(['updated_at', '2026-11-09T10:00:00.123456+00:00']);
  });
  it('reports a conflict when no row matched', async () => {
    const { client } = fakeClient({ results: [{ data: [], error: null }] });
    expect(await saveProduct(client, input, 'p1', 'old')).toMatchObject({ ok: false, error: 'conflict' });
  });
  it('maps a duplicate slug to the field', async () => {
    const { client } = fakeClient({ results: [{ data: null, error: { code: '23505', message: 'dup' } }] });
    const r = await saveProduct(client, input);
    expect(r.ok === false && r.error === 'validation' && r.fields.slug).toBeTruthy();
  });
});

describe('guardedSaveProduct', () => {
  it('refuses without a session and never touches the database', async () => {
    const { client, from } = fakeClient({ user: null });
    expect(await guardedSaveProduct(client, raw)).toMatchObject({ ok: false, error: 'session' });
    expect(from).not.toHaveBeenCalled();
  });
  it('removes only uploaded images that left the product', async () => {
    const { publicBase } = await import('@/lib/admin/images');
    const base = publicBase();
    const { client, remove } = fakeClient({ results: [
      { data: { images: [`${base}products/old.webp`, '/sample/a.jpg', `${base}products/keep.webp`] }, error: null },
      { data: [{ id: 'p1' }], error: null },
    ] });
    await guardedSaveProduct(client, { ...raw, images: [`${base}products/keep.webp`] }, 'p1', 'v1');
    expect(remove).toHaveBeenCalledWith(['products/old.webp']);
  });
  it('keeps images when the save conflicts', async () => {
    const { publicBase } = await import('@/lib/admin/images');
    const { client, remove } = fakeClient({ results: [
      { data: { images: [`${publicBase()}products/old.webp`] }, error: null },
      { data: [], error: null },
    ] });
    expect(await guardedSaveProduct(client, raw, 'p1', 'v1')).toMatchObject({ error: 'conflict' });
    expect(remove).not.toHaveBeenCalled();
  });
});

describe('guardedDeleteProduct', () => {
  it('refuses without a session', async () => {
    const { client, from } = fakeClient({ user: null });
    expect(await guardedDeleteProduct(client, 'p1')).toMatchObject({ ok: false, error: 'session' });
    expect(from).not.toHaveBeenCalled();
  });
});

describe('categories', () => {
  it('refuses to save without a session', async () => {
    const { client, from } = fakeClient({ user: null });
    expect(await guardedSaveCategory(client, { label: 'x', image: '/a' })).toMatchObject({ error: 'session' });
    expect(from).not.toHaveBeenCalled();
  });
  it('explains a delete blocked by products', async () => {
    const { client } = fakeClient({ results: [
      { data: { image: '/a' }, error: null },
      { data: null, error: { code: '23503', message: 'fk' } },
    ] });
    expect(await guardedDeleteCategory(client, 'c1')).toMatchObject({ ok: false, error: 'unknown', message: 'A categoria ainda tem produtos.' });
  });
});
