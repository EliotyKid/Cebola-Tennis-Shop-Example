import type { SupabaseClient } from '@supabase/supabase-js';
import { SESSION_EXPIRED, getAdminUser, type ActionResult } from './auth';
import { publicBase, removeStorageFiles, unusedStoragePaths } from './images';
import { parseCategoryInput, slugify } from './validation';

const FAILED: ActionResult = { ok: false, error: 'unknown', message: 'Não foi possível salvar. Tente novamente.' };

export async function guardedSaveCategory(client: SupabaseClient, raw: unknown, id?: string): Promise<ActionResult> {
  if (!await getAdminUser(client)) return SESSION_EXPIRED;
  const parsed = parseCategoryInput(raw);
  if (!parsed.ok) return { ok: false, error: 'validation', fields: parsed.fields };
  const { label, image } = parsed.value;

  if (id) {
    const { data: current, error: readError } = await client.from('categories').select('image').eq('id', id).maybeSingle();
    if (readError) return FAILED;
    const { error } = await client.from('categories').update({ label, image }).eq('id', id);
    if (error) return FAILED;
    await removeStorageFiles(client, unusedStoragePaths(current ? [current.image] : [], [image], publicBase()));
    return { ok: true, id };
  }

  const { count, error: countError } = await client.from('categories').select('id', { count: 'exact', head: true });
  if (countError) return FAILED;
  const slug = slugify(label);
  const { error } = await client.from('categories').insert({ id: slug, slug, label, image, position: count ?? 0 });
  if (error?.code === '23505') return { ok: false, error: 'validation', fields: { label: 'Já existe uma categoria com este nome.' } };
  return error ? FAILED : { ok: true, id: slug };
}

export async function guardedDeleteCategory(client: SupabaseClient, id: string): Promise<ActionResult> {
  if (!await getAdminUser(client)) return SESSION_EXPIRED;
  const { data, error: readError } = await client.from('categories').select('image').eq('id', id).maybeSingle();
  if (readError) return { ok: false, error: 'unknown', message: 'Não foi possível excluir. Tente novamente.' };
  const { error } = await client.from('categories').delete().eq('id', id);
  if (error?.code === '23503') return { ok: false, error: 'unknown', message: 'A categoria ainda tem produtos.' };
  if (error) return { ok: false, error: 'unknown', message: 'Não foi possível excluir. Tente novamente.' };
  await removeStorageFiles(client, unusedStoragePaths(data ? [data.image] : [], [], publicBase()));
  return { ok: true };
}

export async function guardedReorderCategories(client: SupabaseClient, ids: string[]): Promise<ActionResult> {
  if (!await getAdminUser(client)) return SESSION_EXPIRED;
  const results = await Promise.all(ids.map((id, position) => client.from('categories').update({ position }).eq('id', id)));
  return results.some(r => r.error) ? FAILED : { ok: true };
}
