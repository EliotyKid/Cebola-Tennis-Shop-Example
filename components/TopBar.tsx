'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, IconButton } from './cb/actions';
import { Icon, Logo } from './cb/brand';
import { SiteHeader } from './cb/navigation';
import { BuyButton } from './BuyButton';
import { CONSULT_MESSAGE } from '@/lib/copy';
import { useStore } from './StoreProvider';

const LINKS = [
  { label: 'Catálogo', href: '/catalogo' },
  { label: 'Raquetes', href: '/catalogo/raquetes' },
  { label: 'Calçados', href: '/catalogo/calcados' },
  { label: 'Promoções', href: '/catalogo?promocao=1' },
];

export function TopBar() {
  const pathname = usePathname();
  const { cart, favorites } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > window.innerHeight * 0.7);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, [pathname]);

  useEffect(() => setMenu(false), [pathname]);

  const items = [...LINKS, { label: 'Favoritos', href: '/favoritos' }, { label: 'Sacola', href: '/sacola' }];
  return (
    <>
      <div className="topbar">
        <SiteHeader
          links={LINKS}
          active={LINKS.find(l => l.href === pathname)?.href}
          overlay={pathname === '/' && !scrolled}
          cartCount={cart.reduce((s, l) => s + l.qty, 0)}
          favCount={favorites.length}
          onMenu={() => setMenu(true)}
        />
      </div>
      <div className={`mmenu${menu ? ' mmenu--open' : ''}`} aria-hidden={!menu} inert={!menu}>
        <div className="mmenu__scrim" onClick={() => setMenu(false)} />
        <aside className="mmenu__panel">
          <div className="mmenu__top">
            <Logo variant="light" height={44} />
            <IconButton icon="x" variant="glass" label="Fechar" onClick={() => setMenu(false)} />
          </div>
          <nav className="mmenu__nav">
            {items.map((l, i) => <Link key={l.href} href={l.href} onClick={() => setMenu(false)} style={{ transitionDelay: `${120 + i * 50}ms` }}>{l.label}</Link>)}
          </nav>
          <div style={{ marginTop: 'auto' }}><BuyButton block arrow label="Falar com consultor" message={CONSULT_MESSAGE} /></div>
        </aside>
      </div>
    </>
  );
}

export function Toast() {
  const { toast } = useStore();
  return (
    <div className={`toast${toast ? ' toast--on' : ''}`} role="status">
      <span className="toast__tick"><Icon name="check" size={14} strokeWidth={2.5} /></span>
      <span>{toast ?? 'Adicionado'}</span>
      <Button size="sm" href="/sacola">Ver sacola</Button>
    </div>
  );
}
