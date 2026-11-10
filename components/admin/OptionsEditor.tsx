'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/cb/actions';
import type { ProductOption } from '@/lib/types';
import { Field } from './Field';

// Values are edited as text, so each option keeps its raw string while the employee types the commas.
export function OptionsEditor({ options, onChange }: { options: ProductOption[]; onChange: (o: ProductOption[]) => void }) {
  const update = (i: number, patch: Partial<ProductOption>) => onChange(options.map((o, k) => (k === i ? { ...o, ...patch } : o)));
  return (
    <div className="adm-options">
      {options.map((o, i) => (
        <div key={i} className="adm-options__row">
          <Field label="Nome da opção">
            <span className="cb-input"><input value={o.label} placeholder="Tamanho" onChange={e => update(i, { label: e.target.value })} /></span>
          </Field>
          <Field label="Valores, separados por vírgula">
            <span className="cb-input"><input value={o.values.join(',')} placeholder="P,M,G" onChange={e => update(i, { values: e.target.value.split(',') })} /></span>
          </Field>
          <button type="button" className="adm-icon" aria-label={`Remover opção ${o.label || i + 1}`} onClick={() => onChange(options.filter((_, k) => k !== i))}><Trash2 size={18} strokeWidth={1.5} /></button>
        </div>
      ))}
      <div><Button variant="outline" size="sm" onClick={() => onChange([...options, { label: '', values: [''] }])}><Plus size={14} /> Adicionar opção</Button></div>
    </div>
  );
}
