import type { Product } from './types';

export type CartAttr = { label: string; value: string };
export type CartLine = { key: string; id: string; qty: number; attrs: CartAttr[] };

export const MAX_QTY = 99;

export const lineKey = (id: string, attrs: CartAttr[]): string =>
  `${id}|${attrs.map(a => a.value).join('/')}`;

export function addLine(lines: CartLine[], id: string, qty: number, attrs: CartAttr[]): CartLine[] {
  const key = lineKey(id, attrs);
  return lines.some(l => l.key === key)
    ? lines.map(l => (l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l))
    : [...lines, { key, id, qty, attrs }];
}

export function parseStored<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) === Array.isArray(fallback) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}

const isAttr = (a: unknown): a is CartAttr => {
  const attr = a as CartAttr | null;
  return typeof attr?.label === 'string' && typeof attr?.value === 'string';
};

// localStorage is user-editable and may hold data from older versions of the site.
export function sanitizeLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  return value.filter((line): line is CartLine =>
    typeof line?.key === 'string'
    && typeof line?.id === 'string'
    && Number.isInteger(line?.qty) && line.qty >= 1 && line.qty <= MAX_QTY
    && Array.isArray(line?.attrs) && line.attrs.every(isAttr));
}

export function resolveLines(lines: CartLine[], products: Product[]): (CartLine & { product: Product })[] {
  return lines.flatMap(line => {
    const product = products.find(p => p.id === line.id);
    return product ? [{ ...line, product }] : [];
  });
}
