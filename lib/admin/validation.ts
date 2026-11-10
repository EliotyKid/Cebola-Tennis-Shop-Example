import type { Product, ProductOption } from '@/lib/types';

export const BADGE_TONES = ['lime', 'dark', 'sale', 'light'] as const;
type BadgeTone = (typeof BADGE_TONES)[number];

export type ProductFormValues = {
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  price: string;
  oldPrice: string;
  images: string[];
  badgeLabel: string;
  badgeTone: string;
  description: string;
  options: ProductOption[];
  sku: string;
  featured: boolean;
  isNew: boolean;
  inStock: boolean;
};

export type ProductInput = {
  slug: string;
  name: string;
  brand: string;
  categoryId: string;
  price: number;
  oldPrice: number | null;
  images: string[];
  badge: { label: string; tone: BadgeTone } | null;
  description: string;
  options: ProductOption[];
  sku: string | null;
  featured: boolean;
  isNew: boolean;
  inStock: boolean;
};

type Parsed<T> = { ok: true; value: T } | { ok: false; fields: Record<string, string> };

export const slugify = (s: string): string => s
  .normalize('NFD').replace(/\p{M}/gu, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

// Largest value that fits numeric(10,2).
const MAX_PRICE = 99_999_999.99;

export function parseBrl(input: string): number | null {
  const s = input.trim().replace(/^R\$\s*/, '');
  let plain: string;
  if (/^(\d{1,3}(\.\d{3})+|\d+),\d{1,2}$/.test(s)) plain = s.replaceAll('.', '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) plain = s.replaceAll('.', '');
  else if (/^\d+(\.\d{1,2})?$/.test(s)) plain = s;
  else return null;
  const n = Number(plain);
  return n <= MAX_PRICE ? n : null;
}

export const formatBrlInput = (n: number): string => n.toFixed(2).replace('.', ',');

const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

const parseOptions = (v: unknown): ProductOption[] | null => {
  if (!Array.isArray(v)) return null;
  const options: ProductOption[] = [];
  for (const raw of v as { label?: unknown; values?: unknown }[]) {
    if (!Array.isArray(raw?.values)) return null;
    const label = text(raw.label);
    const values = [...new Set(raw.values.map(text).filter(Boolean))];
    if (!label || values.length === 0) return null;
    options.push({ label, values });
  }
  return options;
};

// Runs on the server: the payload is untrusted even though the form is ours.
export function parseProductInput(raw: unknown): Parsed<ProductInput> {
  const r = (raw ?? {}) as Record<string, unknown>;
  const fields: Record<string, string> = {};
  const required = (key: string, message: string) => {
    const value = text(r[key]);
    if (!value) fields[key] = message;
    return value;
  };

  const name = required('name', 'Informe o nome.');
  const brand = required('brand', 'Informe a marca.');
  const categoryId = required('categoryId', 'Escolha uma categoria.');
  const description = required('description', 'Escreva uma descrição.');

  const slug = slugify(text(r.slug) || name);
  if (!slug && !fields.name) fields.slug = 'Use letras ou números no endereço.';

  const price = parseBrl(text(r.price));
  if (price === null) fields.price = 'Informe um preço válido, como 1.599,90.';

  const oldText = text(r.oldPrice);
  const oldPrice = oldText ? parseBrl(oldText) : null;
  if (oldText && oldPrice === null) fields.oldPrice = 'Informe um preço válido, como 1.599,90.';
  else if (oldPrice !== null && price !== null && oldPrice <= price) fields.oldPrice = 'O preço anterior precisa ser maior que o preço atual.';

  const images = Array.isArray(r.images) ? r.images.filter((i): i is string => typeof i === 'string' && i !== '') : [];
  if (images.length === 0) fields.images = 'Adicione ao menos uma imagem.';

  const options = parseOptions(r.options ?? []);
  if (!options) fields.options = 'Toda opção precisa de nome e de ao menos um valor.';

  if (Object.keys(fields).length > 0) return { ok: false, fields };

  const badgeLabel = text(r.badgeLabel);
  const tone = BADGE_TONES.find(t => t === r.badgeTone) ?? 'lime';
  return {
    ok: true,
    value: {
      slug, name, brand, categoryId, description, images,
      price: price!,
      oldPrice,
      badge: badgeLabel ? { label: badgeLabel, tone } : null,
      options: options!,
      sku: text(r.sku) || null,
      featured: r.featured === true,
      isNew: r.isNew === true,
      inStock: r.inStock !== false,
    },
  };
}

export function parseCategoryInput(raw: unknown): Parsed<{ label: string; image: string }> {
  const r = (raw ?? {}) as Record<string, unknown>;
  const label = text(r.label);
  const image = text(r.image);
  const fields: Record<string, string> = {};
  if (!label) fields.label = 'Informe o nome.';
  else if (!slugify(label)) fields.label = 'Use letras ou números no nome.';
  if (!image) fields.image = 'Adicione uma imagem.';
  return Object.keys(fields).length > 0 ? { ok: false, fields } : { ok: true, value: { label, image } };
}

export const toFormValues = (p: Product): ProductFormValues => ({
  name: p.name,
  slug: p.slug,
  brand: p.brand,
  categoryId: p.categoryId,
  price: formatBrlInput(p.price),
  oldPrice: p.oldPrice === undefined ? '' : formatBrlInput(p.oldPrice),
  images: p.images,
  badgeLabel: p.badge?.label ?? '',
  badgeTone: p.badge?.tone ?? 'lime',
  description: p.description,
  options: p.options,
  sku: p.sku ?? '',
  featured: p.featured === true,
  isNew: p.isNew === true,
  inStock: p.inStock,
});
