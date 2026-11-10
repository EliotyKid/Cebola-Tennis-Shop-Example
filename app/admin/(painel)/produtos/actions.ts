'use server';

import { revalidatePath, updateTag } from 'next/cache';
import type { ActionResult } from '@/lib/admin/auth';
import { guardedDeleteProduct, guardedSaveProduct } from '@/lib/admin/products';
import { CATALOG_TAG } from '@/lib/catalog-db';
import { createServerSupabase } from '@/lib/supabase/server';

const expireCatalog = (result: ActionResult) => {
  if (result.ok) {
    updateTag(CATALOG_TAG);
    revalidatePath('/', 'layout');
  }
  return result;
};

export async function saveProductAction(raw: unknown, id?: string, expectedUpdatedAt?: string): Promise<ActionResult> {
  return expireCatalog(await guardedSaveProduct(await createServerSupabase(), raw, id, expectedUpdatedAt));
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  return expireCatalog(await guardedDeleteProduct(await createServerSupabase(), id));
}
