'use client';

import { ExternalLink, LogOut, Package, Tags } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { logoutAction } from '@/app/admin/login/actions';
import { Logo } from '@/components/cb/brand';

const LINKS = [
  { href: '/admin', label: 'Produtos', icon: Package, active: (p: string) => p === '/admin' || p.startsWith('/admin/produtos') },
  { href: '/admin/categorias', label: 'Categorias', icon: Tags, active: (p: string) => p.startsWith('/admin/categorias') },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="adm">
      <aside className="adm-nav">
        <Link href="/admin" className="adm-nav__logo" aria-label="Início do admin"><Logo height={36} /></Link>
        <nav className="adm-nav__links" aria-label="Admin">
          {LINKS.map(({ href, label, icon: Icon, active }) => (
            <Link key={href} href={href} className="adm-nav__link" aria-current={active(pathname) ? 'page' : undefined}>
              <Icon size={18} strokeWidth={1.5} /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="adm-nav__foot">
          <a href="/" target="_blank" rel="noopener noreferrer" className="adm-nav__link"><ExternalLink size={18} strokeWidth={1.5} /><span>Ver loja</span></a>
          <form action={logoutAction}>
            <button type="submit" className="adm-nav__link"><LogOut size={18} strokeWidth={1.5} /><span>Sair</span></button>
          </form>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
