import { describe, expect, it } from 'vitest';
import { buildMessage, buildWhatsAppUrl } from '@/lib/whatsapp';

const racket = { name: 'Raquete Wilson Burn 100 V5.0', qty: 1, price: 1599.9, attrs: [{ label: 'Grip', value: 'L2' }] };
const balls = { name: 'Bola Head Reset', qty: 2, price: 89.9, attrs: [] };

describe('buildMessage', () => {
  it('describes a single product', () => {
    const m = buildMessage([racket]);
    expect(m.startsWith('Olá! Tenho interesse neste produto:')).toBe(true);
    expect(m).toContain('1x Raquete Wilson Burn 100 V5.0 (Grip: L2)');
    expect(m.endsWith('Pode me ajudar?')).toBe(true);
  });
  it('lists several products with the estimated total', () => {
    const m = buildMessage([racket, balls]);
    expect(m.startsWith('Olá! Tenho interesse nestes produtos:')).toBe(true);
    expect(m).toContain('Total estimado: R$ 1.779,70');
  });
  it('omits parentheses when there are no options', () => {
    expect(buildMessage([balls])).toContain('2x Bola Head Reset — ');
  });
});

describe('buildMessage with out-of-stock items', () => {
  const missing = { ...racket, outOfStock: true };
  it('asks about availability when the only item is out of stock', () => {
    const m = buildMessage([missing]);
    expect(m.startsWith('Olá! Este produto está fora de estoque:')).toBe(true);
    expect(m).toContain('Quero saber quando volta ou como encomendar.');
    expect(m).not.toContain('Total estimado');
    expect(m).not.toContain('R$');
  });
  it('leaves out-of-stock items out of the total and lists them apart', () => {
    const m = buildMessage([balls, missing]);
    expect(m.startsWith('Olá! Tenho interesse neste produto:')).toBe(true);
    expect(m).toContain('Total estimado: R$ 179,80');
    expect(m).toContain('Fora de estoque (quero saber quando volta ou como encomendar):\n- 1x Raquete Wilson Burn 100 V5.0 (Grip: L2)');
  });
});

describe('buildWhatsAppUrl', () => {
  it('keeps only digits and round-trips special characters', () => {
    const text = 'a & b #1 + "c"';
    const url = buildWhatsAppUrl('55 (11) 99999-9999', text)!;
    expect(url.startsWith('https://wa.me/5511999999999?text=')).toBe(true);
    expect(new URL(url).searchParams.get('text')).toBe(text);
  });
  it('returns null without a number', () => {
    expect(buildWhatsAppUrl(undefined, 'x')).toBeNull();
    expect(buildWhatsAppUrl('', 'x')).toBeNull();
    expect(buildWhatsAppUrl('sem numero', 'x')).toBeNull();
  });
});
