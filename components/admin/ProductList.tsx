'use client';

import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { deleteProductAction } from '@/app/admin/(painel)/produtos/actions';
import { Button } from '@/components/cb/actions';
import { Select } from '@/components/cb/forms';
import { SafeImage } from '@/components/SafeImage';
import { filterAdminProducts } from '@/lib/admin/list';
import { brl } from '@/lib/format';
import type { Category, Product } from '@/lib/types';
import { ConfirmDialog } from './Modal';

export function ProductList({ products, categories, saved }: { products: Product[]; categories: Category[]; saved: boolean }) {
  const [q, setQ] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [target, setTarget] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removed, setRemoved] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const visible = useMemo(() => filterAdminProducts(products, q, categoryId), [products, q, categoryId]);
  const labels = new Map(categories.map(c => [c.id, c.label]));

  const confirmDelete = () => {
    if (!target) return;
    startTransition(async () => {
      setError(null);
      try {
        const result = await deleteProductAction(target.id);
        if (result.ok) {
          setRemoved(target.name);
          setTarget(null);
        } else {
          setError(result.error === 'validation' ? 'Não foi possível excluir.' : result.message);
        }
      } catch {
        setError('Não foi possível excluir. Verifique sua conexão e tente novamente.');
      }
    });
  };

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1 className="adm-title">Produtos</h1>
          <p className="adm-sub">{products.length} {products.length === 1 ? 'produto cadastrado' : 'produtos cadastrados'}</p>
        </div>
        <Button href="/admin/produtos/novo"><Plus size={16} /> Novo produto</Button>
      </header>

      {saved && !removed ? <p className="adm-alert adm-alert--ok" role="status">Produto salvo. A loja já foi atualizada.</p> : null}
      {removed ? <p className="adm-alert adm-alert--ok" role="status">{removed} foi excluído.</p> : null}

      <div className="adm-filters">
        <label className="cb-input cb-input--white adm-filters__search">
          <Search size={16} strokeWidth={1.5} aria-hidden="true" />
          <input type="search" aria-label="Buscar produtos" placeholder="Buscar por nome, marca ou código" value={q} onChange={e => setQ(e.target.value)} />
        </label>
        <Select value={categoryId} onChange={setCategoryId} options={[{ value: '', label: 'Todas as categorias' }, ...categories.map(c => ({ value: c.id, label: c.label }))]} />
      </div>

      {products.length === 0 ? (
        <div className="adm-empty">
          <h2>Nenhum produto ainda</h2>
          <p>Cadastre o primeiro para ele aparecer na loja.</p>
          <Button href="/admin/produtos/novo">Novo produto</Button>
        </div>
      ) : visible.length === 0 ? (
        <div className="adm-empty">
          <h2>Nada encontrado</h2>
          <p>Tente outro termo ou limpe os filtros.</p>
          <Button variant="outline" onClick={() => { setQ(''); setCategoryId(''); }}>Limpar filtros</Button>
        </div>
      ) : (
        <ul className="adm-list">
          {visible.map(p => (
            <li key={p.id} className="adm-row">
              <div className="adm-row__thumb"><SafeImage src={p.images[0]} alt="" loading="lazy" /></div>
              <div className="adm-row__main">
                <Link href={`/admin/produtos/${p.id}`} className="adm-row__name">{p.name}</Link>
                <span className="adm-row__meta">{p.brand} · {labels.get(p.categoryId)}</span>
              </div>
              <span className="adm-row__price">{brl(p.price)}</span>
              <span className={`adm-pill${p.inStock ? '' : ' adm-pill--off'}`}>{p.inStock ? 'Em estoque' : 'Fora de estoque'}</span>
              <div className="adm-row__actions">
                <Link href={`/admin/produtos/${p.id}`} className="adm-icon" aria-label={`Editar ${p.name}`}><Pencil size={18} strokeWidth={1.5} /></Link>
                <button type="button" className="adm-icon" aria-label={`Excluir ${p.name}`} onClick={() => { setError(null); setTarget(p); }}><Trash2 size={18} strokeWidth={1.5} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {target ? (
        <ConfirmDialog title="Excluir produto" confirmLabel="Excluir" pending={pending} error={error} onConfirm={confirmDelete} onClose={() => setTarget(null)}>
          {target.name} será removido da loja e as imagens enviadas serão apagadas. Essa ação não pode ser desfeita.
        </ConfirmDialog>
      ) : null}
    </div>
  );
}
