import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error('Set the Supabase variables in .env.local');

const supabase = createClient(url, key, { auth: { persistSession: false } });
let failed = false;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ` (${detail})` : ''}`);
  if (!ok) failed = true;
};

const { data: rows, error: readError } = await supabase.from('products').select('id, name').limit(1);
check('anon reads products', !readError && rows.length === 1, readError?.message);
const sample = rows?.[0];

const insert = await supabase.from('categories').insert({ slug: 'rls-probe', label: 'x', image: 'x' }).select();
check('anon cannot insert', Boolean(insert.error) || insert.data.length === 0, insert.error?.code);

const update = await supabase.from('products').update({ name: 'rls-probe' }).eq('id', sample?.id).select();
check('anon cannot update', Boolean(update.error) || update.data.length === 0, update.error?.code);

const del = await supabase.from('products').delete().eq('id', sample?.id).select();
check('anon cannot delete', Boolean(del.error) || del.data.length === 0, del.error?.code);

const upload = await supabase.storage.from('catalog').upload(`rls-probe-${Date.now()}.webp`, new Blob(['x'], { type: 'image/webp' }));
check('anon cannot upload', Boolean(upload.error), upload.error?.message);

const settings = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } }).then(r => r.json());
check('public sign-up disabled', settings.disable_signup === true);

process.exit(failed ? 1 : 0);
