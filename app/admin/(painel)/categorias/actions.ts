'use server';

import { revalidatePath, updateTag } from 'next/cache';
import type { ActionResult } from '@/lib/admin/auth';
import { guardedDeleteCategory, guardedReorderCategories, guardedSaveCategory } from '@/lib/admin/categories';
import { CATALOG_TAG } from '@/lib/catalog-db';
import { createServerSupabase } from '@/lib/supabase/server';

const expireCatalog = (result: ActionResult) => {
  if (result.ok) {
    updateTag(CATALOG_TAG);
    revalidatePath('/', 'layout');
  }
  return result;
};

export async function saveCategoryAction(raw: unknown, id?: string): Promise<ActionResult> {
  return expireCatalog(await guardedSaveCategory(await createServerSupabase(), raw, id));
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  return expireCatalog(await guardedDeleteCategory(await createServerSupabase(), id));
}

export async function reorderCategoriesAction(ids: string[]): Promise<ActionResult> {
  return expireCatalog(await guardedReorderCategories(await createServerSupabase(), ids));
}
