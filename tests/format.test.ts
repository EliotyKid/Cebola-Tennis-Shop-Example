import { describe, expect, it } from 'vitest';
import { brl, installments, pixPrice } from '@/lib/format';

describe('format', () => {
  it('formats BRL with a non-breaking space', () => {
    expect(brl(1599.9)).toBe('R$ 1.599,90');
  });
  it('formats the installments line', () => {
    expect(installments(1599.9)).toBe('10x de R$ 159,99 sem juros');
  });
  it('applies the Pix discount rounded to cents', () => {
    expect(pixPrice(1599.9)).toBe(1519.91);
  });
});
