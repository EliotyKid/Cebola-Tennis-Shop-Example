export const INSTALLMENTS = 10;
export const PIX_DISCOUNT = 0.05;

export const brl = (n: number): string =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const installments = (n: number): string =>
  `${INSTALLMENTS}x de ${brl(n / INSTALLMENTS)} sem juros`;

// Works in integer cents so that 1519.905 rounds up instead of drifting down in floating point.
export const pixPrice = (n: number): number =>
  Math.round((Math.round(n * 100) * Math.round((1 - PIX_DISCOUNT) * 100)) / 100) / 100;
