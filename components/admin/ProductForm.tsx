'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition, type FormEvent, type ReactNode } from 'react';
import { saveProductAction } from '@/app/admin/(painel)/produtos/actions';
import { Button } from '@/components/cb/actions';
import { Checkbox, Select } from '@/components/cb/forms';
import { slugify, type ProductFormValues } from '@/lib/admin/validation';
import type { Category } from '@/lib/types';
import { Field } from './Field';
import { ImageManager } from './ImageManager';
import { OptionsEditor } from './OptionsEditor';

const UNSAVED = 'Você tem alterações não salvas. Sair mesmo assim?';
const TONES = [
  { value: 'lime', label: 'Verde-limão' }, { value: 'dark', label: 'Escuro' },
  { value: 'sale', label: 'Promoção' }, { value: 'light', label: 'Claro' },
];

type Notice = { kind: 'session' | 'conflict' | 'unknown'; message: string };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="adm-card"><h2>{title}</h2>{children}</section>;
}

export function ProductForm({ initial, categories, id, updatedAt }: { initial: ProductFormValues; categories: Category[]; id?: string; updatedAt?: string }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const dirty = useRef(false);
  const slugTouched = useRef(Boolean(id));
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => { if (dirty.current) e.preventDefault(); };
    // beforeunload does not see client-side navigation.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest?.('a[href]');
      if (!dirty.current || !link || link.getAttribute('target') === '_blank' || window.confirm(UNSAVED)) return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener('beforeunload', onUnload);
    document.addEventListener('click', onClick, true);
    return () => { window.removeEventListener('beforeunload', onUnload); document.removeEventListener('click', onClick, true); };
  }, []);

  const set = (patch: Partial<ProductFormValues>) => {
    dirty.current = true;
    setValues(v => ({ ...v, ...patch }));
  };
  const setName = (name: string) => set(slugTouched.current ? { name } : { name, slug: slugify(name) });
  const input = (key: 'brand' | 'price' | 'oldPrice' | 'sku' | 'badgeLabel') => ({ value: values[key], onChange: (e: { target: { value: string } }) => set({ [key]: e.target.value }) });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      setNotice(null);
      setFields({});
      try {
        const result = await saveProductAction(values, id, updatedAt);
        if (result.ok) {
          dirty.current = false;
          router.push('/admin?salvo=1');
        } else if (result.error === 'validation') {
          setFields(result.fields);
          requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('.cb-field--error input, .cb-field--error textarea, [data-invalid] input')?.focus());
        } else {
          setNotice({ kind: result.error, message: result.message });
        }
      } catch {
        setNotice({ kind: 'unknown', message: 'Não foi possível salvar. Verifique sua conexão e tente novamente.' });
      }
    });
  };

  return (
    <form ref={form} className="adm-page adm-form" onSubmit={submit} noValidate>
      <Link href="/admin" className="adm-back"><ArrowLeft size={16} /> Produtos</Link>
      <h1 className="adm-title">{id ? 'Editar produto' : 'Novo produto'}</h1>

      <Section title="Informações básicas">
        <div className="adm-grid">
          <Field label="Nome" error={fields.name}><span className="cb-input"><input value={values.name} onChange={e => setName(e.target.value)} /></span></Field>
          <Field label="Marca" error={fields.brand}><span className="cb-input"><input {...input('brand')} /></span></Field>
          <div className={`cb-field${fields.categoryId ? ' cb-field--error' : ''}`}>
            <span className="cb-field__label">Categoria</span>
            <Select value={values.categoryId} onChange={categoryId => set({ categoryId })} options={[{ value: '', label: 'Escolha' }, ...categories.map(c => ({ value: c.id, label: c.label }))]} />
            {fields.categoryId ? <span className="cb-field__hint" role="alert">{fields.categoryId}</span> : null}
          </div>
          <Field label="Código (SKU), opcional"><span className="cb-input"><input {...input('sku')} /></span></Field>
          <div className="adm-span">
            <Field label="Descrição" error={fields.description}><textarea className="adm-textarea adm-textarea--box" rows={5} value={values.description} onChange={e => set({ description: e.target.value })} /></Field>
          </div>
          <div className="adm-span">
            <Field label="Endereço na loja" error={fields.slug} hint={`/produto/${values.slug || '...'}`}>
              <span className="cb-input"><input value={values.slug} onChange={e => { slugTouched.current = true; set({ slug: e.target.value }); }} /></span>
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Preço e estoque">
        <div className="adm-grid">
          <Field label="Preço (R$)" error={fields.price}><span className="cb-input"><input inputMode="decimal" placeholder="1.599,90" {...input('price')} /></span></Field>
          <Field label="Preço anterior (R$), opcional" error={fields.oldPrice} hint="Aparece riscado na loja."><span className="cb-input"><input inputMode="decimal" {...input('oldPrice')} /></span></Field>
          <div className="adm-span adm-stack">
            <Checkbox label="Em estoque" checked={values.inStock} onChange={inStock => set({ inStock })} />
            <span className="cb-field__hint">Sem estoque, o produto continua na loja e o cliente pode consultar pelo WhatsApp.</span>
          </div>
        </div>
      </Section>

      <Section title="Imagens">
        <div data-invalid={fields.images ? '' : undefined}>
          <ImageManager images={values.images} onChange={images => set({ images })} folder="products" onBusy={setUploading} />
          <p className={fields.images ? 'adm-note adm-note--error' : 'adm-note'} role={fields.images ? 'alert' : undefined}>{fields.images ?? 'A primeira imagem é a capa do produto.'}</p>
        </div>
      </Section>

      <Section title="Opções">
        <OptionsEditor options={values.options} onChange={options => set({ options })} />
        {fields.options ? <p className="adm-note adm-note--error" role="alert">{fields.options}</p> : null}
      </Section>

      <Section title="Destaque">
        <div className="adm-grid">
          <Field label="Selo, opcional" hint="Ex.: Novo, -17%"><span className="cb-input"><input {...input('badgeLabel')} /></span></Field>
          <div className="cb-field">
            <span className="cb-field__label">Cor do selo</span>
            <Select value={values.badgeTone} onChange={badgeTone => set({ badgeTone })} options={TONES} />
          </div>
          <div className="adm-span adm-stack">
            <Checkbox label="Mostrar em Recomendados" checked={values.featured} onChange={featured => set({ featured })} />
            <Checkbox label="Mostrar em Novidades" checked={values.isNew} onChange={isNew => set({ isNew })} />
          </div>
        </div>
      </Section>

      <div className="adm-savebar">
        {notice ? (
          <div className="adm-alert adm-alert--error" role="alert">
            {notice.message}{' '}
            {notice.kind === 'session' ? <a href="/admin/login" target="_blank" rel="noopener noreferrer">Entrar em nova aba</a> : null}
            {notice.kind === 'conflict' ? <button type="button" className="adm-linkbtn" onClick={() => { dirty.current = false; window.location.reload(); }}>Recarregar produto</button> : null}
          </div>
        ) : Object.keys(fields).length > 0 ? <div className="adm-alert adm-alert--error" role="alert">Revise os campos destacados.</div> : <span />}
        <Button type="submit" disabled={pending || uploading}>{pending ? 'Salvando...' : uploading ? 'Enviando imagens...' : 'Salvar produto'}</Button>
      </div>
    </form>
  );
}
