'use client';

import { useEffect, useRef, useState, type ButtonHTMLAttributes } from 'react';
import { Icon } from './brand';

type SelectOption = { value: string; label: string };

export function Select({ options, value, onChange, variant = 'filled', align = 'start', className = '' }: {
  options: SelectOption[]; value: string; onChange: (v: string) => void; variant?: 'filled' | 'plain' | 'pill'; align?: 'start' | 'end'; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find(o => o.value === value);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);
  const cls = ['cb-select', variant !== 'filled' && `cb-select--${variant}`, align === 'end' && 'cb-select--end', open && 'cb-select--open', className].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={cls}>
      <button type="button" className="cb-select__trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>{current?.label}</span>
        <Icon name="chevron-down" size={16} className="cb-select__chev" />
      </button>
      {open ? (
        <div className="cb-select__menu" role="listbox">
          {options.map(o => (
            <button key={o.value} type="button" role="option" aria-selected={o.value === value} className={`cb-select__option${o.value === value ? ' cb-select__option--on' : ''}`} onClick={() => { setOpen(false); onChange(o.value); }}>
              <span>{o.label}</span>
              {o.value === value ? <Icon name="check" size={16} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Checkbox({ checked = false, onChange, label }: { checked?: boolean; onChange?: (v: boolean) => void; label: string }) {
  return (
    <label className={`cb-check${checked ? ' cb-check--on' : ''}`}>
      <input type="checkbox" checked={checked} onChange={e => onChange?.(e.target.checked)} />
      <span className="cb-check__box"><Icon name="check" size={13} strokeWidth={2.5} /></span>
      <span>{label}</span>
    </label>
  );
}

export function OptionChip({ selected = false, size = 'md', children, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; size?: 'sm' | 'md' }) {
  const cls = ['cb-chip', selected && 'cb-chip--on', size === 'sm' && 'cb-chip--sm', className].filter(Boolean).join(' ');
  return <button type="button" aria-pressed={selected} className={cls} {...rest}>{children}</button>;
}

export function QuantityStepper({ value = 1, min = 1, max = 99, onChange, size = 'md', className = '' }: {
  value?: number; min?: number; max?: number; onChange?: (v: number) => void; size?: 'sm' | 'md'; className?: string;
}) {
  const set = (v: number) => onChange?.(Math.max(min, Math.min(max, v)));
  return (
    <div className={`cb-qty${size === 'sm' ? ' cb-qty--sm' : ''} ${className}`}>
      <button type="button" className="cb-qty__btn" aria-label="Diminuir" disabled={value <= min} onClick={() => set(value - 1)}><Icon name="minus" size={16} /></button>
      <span className="cb-qty__val" aria-live="polite">{value}</span>
      <button type="button" className="cb-qty__btn" aria-label="Aumentar" disabled={value >= max} onClick={() => set(value + 1)}><Icon name="plus" size={16} /></button>
    </div>
  );
}

export function PriceRange({ min, max, step = 50, value, onChange }: { min: number; max: number; step?: number; value: [number, number]; onChange: (v: [number, number]) => void }) {
  const pct = (x: number) => ((x - min) / (max - min)) * 100;
  const fmt = (n: number) => `R$ ${Math.round(n).toLocaleString('pt-BR')}`;
  return (
    <div className="cb-range">
      <div className="cb-range__track">
        <div className="cb-range__rail" />
        <div className="cb-range__fill" style={{ left: `${pct(value[0])}%`, right: `${100 - pct(value[1])}%` }} />
        <input type="range" aria-label="Preço mínimo" min={min} max={max} step={step} value={value[0]} onChange={e => onChange([Math.min(+e.target.value, value[1] - step), value[1]])} />
        <input type="range" aria-label="Preço máximo" min={min} max={max} step={step} value={value[1]} onChange={e => onChange([value[0], Math.max(+e.target.value, value[0] + step)])} />
      </div>
      <div className="cb-range__inputs">
        <span className="cb-range__box">{fmt(value[0])}</span>
        <span>até</span>
        <span className="cb-range__box">{fmt(value[1])}</span>
      </div>
    </div>
  );
}
