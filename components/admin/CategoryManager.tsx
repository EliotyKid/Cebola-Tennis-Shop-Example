'use client';

import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, useTransition, type FormEvent } from 'react';
import { deleteCategoryAction, reorderCategoriesAction, saveCategoryAction } from '@/app/admin/(painel)/categorias/actions';
import { Button } from '@/components/cb/actions';
import { SafeImage } from '@/components/SafeImage';
import { moveItem } from '@/lib/admin/images';
import type { ActionResult } from '@/lib/admin/auth';
import type { Category } from '@/lib/types';
import { Field } from './Field';
import { ImageManager } from './ImageManager';
import { ConfirmDialog, Modal } from './Modal';

type Row = Category & { count: number };
type Draft = { id?: string; label: string; image: string };

const CONNECTION = 'Não foi possível concluir. Verifique sua conexão e tente novamente.';
const messageOf = (r: Extract<ActionResult, { ok: false }>) => (r.error === 'validation' ? Object.values(r.fields)[0] : r.message);

function Editor({ draft: initial, onClose }: { draft: Draft; onClose: () => void }) {
  const [draft, setDraft] = useState(initial);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      setError(null);
      setFields({});
      try {
        const result = await saveCategoryAction({ label: draft.label, image: draft.image }, draft.id);
        if (result.ok) onClose();
        else if (result.error === 'validation') setFields(result.fields);
        else setError(result.message);
      } catch {
        setError(CONNECTION);
      }
    });
  };
  return (
    <Modal title={draft.id ? 'Editar categoria' : 'Nova categoria'} onClose={onClose}>
      <form className="adm-stack adm-stack--wide" onSubmit={submit} noValidate>
        <Field label="Nome" error={fields.label}><span className="cb-input"><input value={draft.label} autoFocus onChange={e => setDraft(d => ({ ...d, label: e.target.value }))} /></span></Field>
        <div>
          <span className="cb-field__label">Imagem</span>
          <ImageManager images={draft.image ? [draft.image] : []} max={1} folder="categories" onBusy={setUploading} onChange={images => setDraft(d => ({ ...d, image: images[0] ?? '' }))} />
          {fields.image ? <p className="adm-note adm-note--error" role="alert">{fields.image}</p> : null}
        </div>
        {error ? <p className="adm-alert adm-alert--error" role="alert">{error}</p> : null}
        <div className="adm-modal__actions">
          <Button variant="outline" onClick={onClose} disabled={pending}>Cancelar</Button>
          <Button type="submit" disabled={pending || uploading}>{pending ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </form>
    </Modal>
  );
}

export function CategoryManager({ categories }: { categories: Row[] }) {
  const [editing, setEditing] = useState<Draft | null>(null);
  const [target, setTarget] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const move = (from: number, to: number) => startTransition(async () => {
    setListError(null);
    try {
      const result = await reorderCategoriesAction(moveItem(categories, from, to).map(c => c.id));
      if (!result.ok) setListError(messageOf(result));
    } catch {
      setListError(CONNECTION);
    }
  });

  const confirmDelete = () => {
    if (!target) return;
    startTransition(async () => {
      setError(null);
      try {
        const result = await deleteCategoryAction(target.id);
        if (result.ok) setTarget(null);
        else setError(messageOf(result));
      } catch {
        setError(CONNECTION);
      }
    });
  };

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1 className="adm-title">Categorias</h1>
          <p className="adm-sub">A ordem abaixo é a usada na loja.</p>
        </div>
        <Button onClick={() => setEditing({ label: '', image: '' })}><Plus size={16} /> Nova categoria</Button>
      </header>

      {listError ? <p className="adm-alert adm-alert--error" role="alert">{listError}</p> : null}

      {categories.length === 0 ? (
        <div className="adm-empty">
          <h2>Nenhuma categoria ainda</h2>
          <p>Crie a primeira antes de cadastrar produtos.</p>
        </div>
      ) : (
        <ul className="adm-list">
          {categories.map((c, i) => (
            <li key={c.id} className="adm-row adm-row--cat">
              <div className="adm-row__thumb"><SafeImage src={c.image} alt="" loading="lazy" /></div>
              <div className="adm-row__main">
                <span className="adm-row__name">{c.label}</span>
                <span className="adm-row__meta">{c.count} {c.count === 1 ? 'produto' : 'produtos'}</span>
              </div>
              <div className="adm-row__actions">
                <button type="button" className="adm-icon" aria-label={`Subir ${c.label}`} disabled={i === 0 || pending} onClick={() => move(i, i - 1)}><ArrowUp size={18} strokeWidth={1.5} /></button>
                <button type="button" className="adm-icon" aria-label={`Descer ${c.label}`} disabled={i === categories.length - 1 || pending} onClick={() => move(i, i + 1)}><ArrowDown size={18} strokeWidth={1.5} /></button>
                <button type="button" className="adm-icon" aria-label={`Editar ${c.label}`} onClick={() => setEditing({ id: c.id, label: c.label, image: c.image })}><Pencil size={18} strokeWidth={1.5} /></button>
                <button
                  type="button" className="adm-icon" disabled={c.count > 0}
                  aria-label={c.count > 0 ? `${c.label} não pode ser excluída: tem ${c.count} produtos` : `Excluir ${c.label}`}
                  title={c.count > 0 ? `Mova ou exclua os ${c.count} produtos antes` : undefined}
                  onClick={() => { setError(null); setTarget(c); }}
                ><Trash2 size={18} strokeWidth={1.5} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing ? <Editor draft={editing} onClose={() => setEditing(null)} /> : null}
      {target ? (
        <ConfirmDialog title="Excluir categoria" confirmLabel="Excluir" pending={pending} error={error} onConfirm={confirmDelete} onClose={() => setTarget(null)}>
          {target.label} será removida da loja. Essa ação não pode ser desfeita.
        </ConfirmDialog>
      ) : null}
    </div>
  );
}
