import { readFileSync, writeFileSync } from 'node:fs';

const { categories, products } = JSON.parse(readFileSync('data/catalog.json', 'utf8'));

const text = v => (v === undefined || v === null ? 'null' : `'${String(v).replaceAll("'", "''")}'`);
const num = v => (v === undefined || v === null ? 'null' : Number(v).toFixed(2));
const json = v => (v === undefined || v === null ? 'null' : `${text(JSON.stringify(v))}::jsonb`);
const textArray = list => `array[${list.map(text).join(', ')}]::text[]`;

const categoryRows = categories.map((c, i) =>
  `(${[text(c.id), text(c.slug), text(c.label), text(c.image), i].join(', ')})`);

const productRows = products.map(p => `(${[
  text(p.id), text(p.slug), text(p.name), text(p.brand), text(p.categoryId), num(p.price), num(p.oldPrice),
  textArray(p.images), json(p.badge), text(p.description), json(p.options ?? []), text(p.sku),
  p.featured === true, p.isNew === true, true,
].join(', ')})`);

writeFileSync('supabase/seed.sql', `insert into public.categories (id, slug, label, image, position) values
${categoryRows.join(',\n')};

insert into public.products (id, slug, name, brand, category_id, price, old_price, images, badge, description, options, sku, featured, is_new, in_stock) values
${productRows.join(',\n')};
`);
console.log(`${categories.length} categories, ${products.length} products`);
