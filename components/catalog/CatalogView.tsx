'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button, IconButton } from '@/components/cb/actions';
import { Icon } from '@/components/cb/brand';
import { Accordion } from '@/components/cb/content';
import { Checkbox, PriceRange, Select } from '@/components/cb/forms';
import { Breadcrumbs, Pagination } from '@/components/cb/navigation';
import { ProductTile } from '@/components/ProductTile';
import type { CatalogQuery, Category, Product } from '@/lib/types';

const SORTS = [
  { value: 'relevancia', label: 'Mais relevantes' },
  { value: 'menor-preco', label: 'Menor preço' },
  { value: 'maior-preco', label: 'Maior preço' },
];

type Props = {
  title: string;
  crumbs: { label: string; href?: string }[];
  items: Product[];
  total: number;
  page: number;
  pageCount: number;
  query: CatalogQuery;
  brands: string[];
  categories: Category[];
  activeCategory?: string;
  priceMax: number;
};

export function CatalogView({ title, crumbs, items, total, page, pageCount, query, brands, categories, activeCategory, priceMax }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [sheet, setSheet] = useState(false);
  const [price, setPrice] = useState<[number, number]>([query.min ?? 0, query.max ?? priceMax]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Clicks made before the server responds must build on each other, not on stale params.
  const pending = useRef<URLSearchParams | null>(null);

  useEffect(() => setPrice([query.min ?? 0, query.max ?? priceMax]), [query.min, query.max, priceMax]);
  useEffect(() => { pending.current = null; }, [params]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const update = (change: (q: URLSearchParams) => void, keepPage = false) => {
    const next = new URLSearchParams((pending.current ?? params).toString());
    change(next);
    if (!keepPage) next.delete('page');
    pending.current = next;
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const flag = (key: string, on: boolean) => update(q => { if (on) q.set(key, '1'); else q.delete(key); });
  const toggleBrand = (brand: string, on: boolean) => update(q => {
    const rest = q.getAll('marca').filter(b => b !== brand);
    q.delete('marca');
    [...rest, ...(on ? [brand] : [])].forEach(b => q.append('marca', b));
  });
  const changePrice = (v: [number, number]) => {
    setPrice(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => update(q => {
      if (v[0] > 0) q.set('min', String(v[0])); else q.delete('min');
      if (v[1] < priceMax) q.set('max', String(v[1])); else q.delete('max');
    }), 300);
  };

  const clear = () => router.replace(pathname, { scroll: false });
  const flags = (
    <div className="catalog__flags">
      <Checkbox label="Novidades" checked={query.isNew} onChange={v => flag('novo', v)} />
      <Checkbox label="Promoção" checked={query.onSale} onChange={v => flag('promocao', v)} />
    </div>
  );
  const sort = <Select variant="plain" align="end" value={query.sort} options={SORTS} onChange={v => update(q => { if (v === 'relevancia') q.delete('sort'); else q.set('sort', v); })} />;
  const filters = (
    <div>
      <Accordion variant="compact" defaultOpen={[0, 1, 2]} items={[
        { title: 'Categoria', content: <div className="filter-list">{categories.map(c => <Link key={c.id} href={`/catalogo/${c.slug}`} className={c.id === activeCategory ? 'is-on' : undefined}>{c.label}</Link>)}</div> },
        { title: 'Marca', content: <div className="filter-list">{brands.map(b => <Checkbox key={b} label={b} checked={query.brands.includes(b)} onChange={v => toggleBrand(b, v)} />)}</div> },
        { title: 'Preço', content: <PriceRange min={0} max={priceMax} value={price} onChange={changePrice} /> },
      ]} />
      <button type="button" className="filter-clear" onClick={clear}>Limpar filtros</button>
    </div>
  );
  const grid = items.length ? (
    <div className="catalog__grid">{items.map((p, i) => <div key={p.id} style={{ animation: `cb-fade-up var(--dur-slow) var(--ease-out) ${Math.min(i, 8) * 50}ms both` }}><ProductTile product={p} /></div>)}</div>
  ) : (
    <div className="catalog__empty">
      <p>Nenhum produto com esses filtros</p>
      <Button variant="outline" onClick={clear}>Limpar filtros</Button>
    </div>
  );

  return (
    <div className="page">
      <div className="wrap">
        <Breadcrumbs items={crumbs} />
        <div className="catalog">
          <h1 className="catalog__title">{title}</h1>
          <div className="catalog__bar">
            <button type="button" className="catalog__filter-btn" onClick={() => setSheet(true)}>Filtro <Icon name="sliders-horizontal" size={16} /></button>
            <div className="only-desktop-block">{flags}</div>
            {sort}
          </div>
          <aside className="catalog__side">{filters}</aside>
          <div className="catalog__main">
            {grid}
            {pageCount > 1 ? <div className="catalog__pages"><Pagination page={page} total={pageCount} onChange={p => { update(q => q.set('page', String(p)), true); window.scrollTo({ top: 0 }); }} /></div> : null}
          </div>
        </div>
      </div>
      <div className={`sheet${sheet ? ' sheet--open' : ''}`} inert={!sheet}>
        <div className="sheet__scrim" onClick={() => setSheet(false)} />
        <div className="sheet__panel">
          <div className="sheet__grab" />
          <div className="sheet__head"><span>Filtros</span><IconButton icon="x" variant="light" size="sm" label="Fechar" onClick={() => setSheet(false)} /></div>
          <div style={{ marginBottom: 8 }}>{flags}</div>
          {filters}
          <div className="sheet__foot"><Button block size="lg" onClick={() => setSheet(false)}>Ver {total} produtos</Button></div>
        </div>
      </div>
    </div>
  );
}
