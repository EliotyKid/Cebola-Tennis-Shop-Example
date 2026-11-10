import { toCategory, toProduct, type CategoryRow, type ProductRow } from '@/lib/catalog-db';
import { createServerSupabase } from '@/lib/supabase/server';

// Uncached on purpose: employees must always see the latest data.
export async function loadAdminCategories() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('categories').select('*').order('position').order('label').returns<CategoryRow[]>();
  if (error) throw new Error(error.message);
  return data.map(toCategory);
}

export async function loadAdminProducts() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false }).order('id').returns<ProductRow[]>();
  if (error) throw new Error(error.message);
  return data.map(toProduct);
}

export async function loadAdminProduct(id: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle<ProductRow>();
  if (error) throw new Error(error.message);
  return data ? { product: toProduct(data), updatedAt: data.updated_at } : null;
}
