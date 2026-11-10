import type { SupabaseClient } from '@supabase/supabase-js';

export const BUCKET = 'catalog';
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

export const publicBase = () => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!ACCEPTED.includes(file.type)) return 'Use uma imagem JPEG, PNG ou WebP.';
  if (file.size > MAX_IMAGE_BYTES) return 'A imagem precisa ter até 10 MB.';
  return null;
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = [...list];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

// Only files inside our bucket: sample photos and external URLs must never reach storage.remove.
export const unusedStoragePaths = (before: string[], after: string[], base: string): string[] =>
  before.filter(url => url.startsWith(base) && !after.includes(url)).map(url => url.slice(base.length));

// The record is already saved at this point, so a leftover file is not worth failing the action.
export async function removeStorageFiles(client: SupabaseClient, paths: string[]) {
  if (paths.length > 0) await client.storage.from(BUCKET).remove(paths).catch(() => undefined);
}
