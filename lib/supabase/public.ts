import { createClient } from '@supabase/supabase-js';

// No cookies: safe inside cached functions, and only ever sees public data.
export const createPublicSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { auth: { persistSession: false } },
);
