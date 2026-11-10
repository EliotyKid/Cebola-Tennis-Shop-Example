import type { SupabaseClient } from '@supabase/supabase-js';

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: 'validation'; fields: Record<string, string> }
  | { ok: false; error: 'session' | 'conflict' | 'unknown'; message: string };

export const SESSION_EXPIRED: ActionResult = { ok: false, error: 'session', message: 'Sua sessão expirou. Entre novamente para salvar.' };

// getClaims verifies the token signature; getSession only reads the cookie and must not be trusted here.
export async function getAdminUser(client: SupabaseClient): Promise<string | null> {
  const { data, error } = await client.auth.getClaims();
  return error ? null : data?.claims.sub ?? null;
}

// Redirect target comes from the URL, so it must stay inside the admin.
export function safeNext(next: string | null | undefined): string {
  if (!next || !/^\/admin(\/[^\\]*)?$/.test(next) || next.includes('..') || next.includes('//')) return '/admin';
  return next;
}
