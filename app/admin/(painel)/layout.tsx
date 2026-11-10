import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { getAdminUser } from '@/lib/admin/auth';
import { createServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: ReactNode }) {
  if (!await getAdminUser(await createServerSupabase())) redirect('/admin/login');
  return <AdminShell>{children}</AdminShell>;
}
