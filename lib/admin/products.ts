import type { SupabaseClient } from '@supabase/supabase-js';
import { SESSION_EXPIRED, getAdminUser, type ActionResult } from './auth';
import { publicBase, removeStorageFiles, unusedStoragePaths } from './images';
import { parseProductInput, type ProductInput } from './validation';

const toRow = (p: ProductInput) => ({
  slug: p.slug,
  name: p.name,
  brand: p.brand,
  category_id: p.categoryId,
  price: p.price,
  old_price: p.oldPrice,
  images: p.images,
  badge: p.badge,
  description: p.description,
  options: p.options,
  sku: p.sku,
  featured: p.featured,
  is_new: p.isNew,
  in_stock: p.inStock,
});

const FAILED: ActionResult = { ok: false, error: 'unknown', message: 'Não foi possível salvar. Tente novamente.' };

// expectedUpdatedAt stays the database string: going through Date would drop microseconds and never match.
export async function saveProduct(client: SupabaseClient, input: ProductInput, id?: string, expectedUpdatedAt?: string): Promise<ActionResult> {
  const { data, error } = id
    ? await client.from('products').update(toRow(input)).eq('id', id).eq('updated_at', expectedUpdatedAt ?? '').select('id')
    : await client.from('products').insert(toRow(input)).select('id');
  if (error?.code === '23505') return { ok: false, error: 'validation', fields: { slug: 'Já existe um produto com este endereço.' } };
  if (error?.code === '23503') return { ok: false, error: 'validation', fields: { categoryId: 'Esta categoria não existe mais.' } };
  if (error) return FAILED;
  if (data.length === 0) return { ok: false, error: 'conflict', message: 'Outro funcionário alterou este produto enquanto você editava. Nada foi salvo.' };
  return { ok: true, id: data[0].id };
}

export async function guardedSaveProduct(client: SupabaseClient, raw: unknown, id?: string, expectedUpdatedAt?: string): Promise<ActionResult> {
  if (!await getAdminUser(client)) return SESSION_EXPIRED;
  const parsed = parseProductInput(raw);
  if (!parsed.ok) return { ok: false, error: 'validation', fields: parsed.fields };

  let before: string[] = [];
  if (id) {
    const { data, error } = await client.from('products').select('images').eq('id', id).maybeSingle();
    if (error) return FAILED;
    before = data?.images ?? [];
  }
  const result = await saveProduct(client, parsed.value, id, expectedUpdatedAt);
  if (result.ok) await removeStorageFiles(client, unusedStoragePaths(before, parsed.value.images, publicBase()));
  return result;
}

export async function guardedDeleteProduct(client: SupabaseClient, id: string): Promise<ActionResult> {
  if (!await getAdminUser(client)) return SESSION_EXPIRED;
  const { data, error: readError } = await client.from('products').select('images').eq('id', id).maybeSingle();
  if (readError) return { ok: false, error: 'unknown', message: 'Não foi possível excluir. Tente novamente.' };
  const { error } = await client.from('products').delete().eq('id', id);
  if (error) return { ok: false, error: 'unknown', message: 'Não foi possível excluir. Tente novamente.' };
  await removeStorageFiles(client, unusedStoragePaths(data?.images ?? [], [], publicBase()));
  return { ok: true };
}
