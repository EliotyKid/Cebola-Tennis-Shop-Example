create table public.categories (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  label text not null,
  image text not null,
  position integer not null default 0
);

create table public.products (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  name text not null,
  brand text not null,
  category_id text not null references public.categories (id) on delete restrict,
  price numeric(10, 2) not null check (price >= 0),
  old_price numeric(10, 2) check (old_price is null or old_price > price),
  images text[] not null default '{}',
  badge jsonb,
  description text not null default '',
  options jsonb not null default '[]',
  sku text,
  featured boolean not null default false,
  is_new boolean not null default false,
  in_stock boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);

create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = clock_timestamp();
  return new;
end;
$$;

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;

create policy "categories are public" on public.categories
  for select to anon, authenticated using (true);
create policy "staff inserts categories" on public.categories
  for insert to authenticated with check (true);
create policy "staff updates categories" on public.categories
  for update to authenticated using (true) with check (true);
create policy "staff deletes categories" on public.categories
  for delete to authenticated using (true);

create policy "products are public" on public.products
  for select to anon, authenticated using (true);
create policy "staff inserts products" on public.products
  for insert to authenticated with check (true);
create policy "staff updates products" on public.products
  for update to authenticated using (true) with check (true);
create policy "staff deletes products" on public.products
  for delete to authenticated using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalog', 'catalog', true, 5242880, '{image/webp}');

create policy "staff lists catalog images" on storage.objects
  for select to authenticated using (bucket_id = 'catalog');
create policy "staff uploads catalog images" on storage.objects
  for insert to authenticated with check (bucket_id = 'catalog');
create policy "staff updates catalog images" on storage.objects
  for update to authenticated using (bucket_id = 'catalog') with check (bucket_id = 'catalog');
create policy "staff deletes catalog images" on storage.objects
  for delete to authenticated using (bucket_id = 'catalog');
