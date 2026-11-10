'use server';

import { redirect } from 'next/navigation';
import { safeNext } from '@/lib/admin/auth';
import { createServerSupabase } from '@/lib/supabase/server';

export async function loginAction(_: string | null, form: FormData): Promise<string | null> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get('email') ?? '').trim(),
    password: String(form.get('password') ?? ''),
  });
  if (error) return error.status === 400 ? 'E-mail ou senha incorretos.' : 'Não foi possível entrar agora. Tente novamente em instantes.';
  redirect(safeNext(String(form.get('next') ?? '')));
}

export async function logoutAction() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
