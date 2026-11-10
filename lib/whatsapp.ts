import { brl } from './format';

export type WaItem = {
  name: string;
  qty: number;
  price: number;
  attrs: { label: string; value: string }[];
  outOfStock?: boolean;
};

const describeItem = ({ name, qty, attrs }: WaItem) => {
  const options = attrs.length ? ` (${attrs.map(a => `${a.label}: ${a.value}`).join(', ')})` : '';
  return `- ${qty}x ${name}${options}`;
};

const itemLine = (item: WaItem) => `${describeItem(item)} — ${brl(item.price)} cada`;

export function buildMessage(items: WaItem[]): string {
  const available = items.filter(i => !i.outOfStock);
  const missing = items.filter(i => i.outOfStock);
  if (missing.length > 0 && available.length === 0) {
    return [
      `Olá! ${missing.length === 1 ? 'Este produto está' : 'Estes produtos estão'} fora de estoque:`,
      '',
      ...missing.map(describeItem),
      '',
      'Quero saber quando volta ou como encomendar. Pode me ajudar?',
    ].join('\n');
  }
  const total = available.reduce((sum, i) => sum + i.price * i.qty, 0);
  return [
    `Olá! Tenho interesse ${available.length === 1 ? 'neste produto' : 'nestes produtos'}:`,
    '',
    ...available.map(itemLine),
    '',
    `Total estimado: ${brl(total)}`,
    ...(missing.length > 0 ? ['', 'Fora de estoque (quero saber quando volta ou como encomendar):', ...missing.map(describeItem)] : []),
    '',
    'Pode me ajudar?',
  ].join('\n');
}

export function buildWhatsAppUrl(number: string | undefined, message: string): string | null {
  const digits = number?.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null;
}
