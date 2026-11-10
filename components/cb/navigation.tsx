'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { Icon, Logo } from './brand';
import { IconButton } from './actions';

export function Breadcrumbs({ items, className = '' }: { items: { label: string; href?: string }[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={`cb-crumbs ${className}`}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <Fragment key={it.label}>
            {last ? <span className="cb-crumbs__cur" aria-current="page">{it.label}</span> : <Link href={it.href ?? '/'}>{it.label}</Link>}
            {!last ? <Icon name="chevron-right" size={12} /> : null}
          </Fragment>
        );
      })}
    </nav>
  );
}

function windowed(page: number, total: number): (number | '…')[] {
  if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, 4, '…', total];
  if (page >= total - 2) return [1, '…', total - 3, total - 2, total - 1, total];
  return [1, '…', page - 1, page, page + 1, '…', total];
}

export function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  return (
    <nav aria-label="Paginação" className="cb-pages">
      <button type="button" className="cb-pages__item" aria-label="Página anterior" disabled={page <= 1} onClick={() => onChange(page - 1)}><Icon name="chevron-left" size={16} /></button>
      {windowed(page, total).map((p, i) => (p === '…'
        ? <span key={`g${i}`} className="cb-pages__gap">…</span>
        : <button key={p} type="button" aria-current={p === page ? 'page' : undefined} className={`cb-pages__item${p === page ? ' cb-pages__item--on' : ''}`} onClick={() => onChange(p)}>{p}</button>))}
      <button type="button" className="cb-pages__item" aria-label="Próxima página" disabled={page >= total} onClick={() => onChange(page + 1)}><Icon name="chevron-right" size={16} /></button>
    </nav>
  );
}

export type HeaderLink = { label: string; href: string };

export function SiteHeader({ links, active, overlay = false, cartCount = 0, favCount = 0, onMenu }: {
  links: HeaderLink[]; active?: string; overlay?: boolean; cartCount?: number; favCount?: number; onMenu?: () => void;
}) {
  return (
    <header className={`cb-header${overlay ? ' cb-header--overlay' : ''}`}>
      <Link href="/" className="cb-header__logo" aria-label="Cebola Tennis Shop — início">
        <Logo variant={overlay ? 'light' : 'dark'} height={38} />
      </Link>
      <nav className="cb-header__nav">
        {links.map(l => (
          <Link key={l.href} href={l.href} className={`cb-header__link${active === l.href ? ' cb-header__link--on' : ''}`}>{l.label}</Link>
        ))}
      </nav>
      <div className="cb-header__actions">
        <IconButton icon="heart" label="Favoritos" badge={favCount || null} href="/favoritos" className="only-desktop" />
        <IconButton icon="shopping-bag" label="Sacola" badge={cartCount || null} href="/sacola" />
        <IconButton icon="menu" label="Menu" onClick={onMenu} className="only-mobile" />
      </div>
    </header>
  );
}

export function SiteFooter({ address = 'Endereço da loja — Cidade/UF', email = 'contato@cebolatennis.com.br', phone = '+55 (00) 00000-0000', categories, children }: {
  address?: string; email?: string; phone?: string; categories: { label: string; href: string }[]; children?: React.ReactNode;
}) {
  return (
    <footer className="cb-footer">
      <div className="cb-footer__top">
        <div className="cb-footer__brand">
          <Logo variant="light" height={64} />
          <div className="cb-footer__addr"><Icon name="map-pin" size={16} />{address}</div>
          <p className="cb-footer__news">Ficou com dúvida? A gente ajuda a escolher pelo WhatsApp.</p>
          {children}
        </div>
        <div>
          <div className="cb-footer__cols">
            <div>
              <h4 className="cb-footer__h">Dúvidas ou sugestões?</h4>
              <ul className="cb-footer__list"><li><a href={`mailto:${email}`}>{email}</a></li></ul>
              <h4 className="cb-footer__h">Fale com a gente</h4>
              <ul className="cb-footer__list"><li>{phone}</li></ul>
            </div>
            <div>
              <h4 className="cb-footer__h">Categorias</h4>
              <ul className="cb-footer__list">{categories.map(c => <li key={c.href}><Link href={c.href}>{c.label}</Link></li>)}</ul>
            </div>
          </div>
        </div>
      </div>
      <div className="cb-footer__bottom">
        <span>© Cebola Tennis Shop. Todos os direitos reservados</span>
      </div>
    </footer>
  );
}
