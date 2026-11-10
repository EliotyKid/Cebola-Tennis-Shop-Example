import type { ReactNode } from 'react';
import { BuyButton } from '@/components/BuyButton';
import { SiteFooter } from '@/components/cb/navigation';
import { StoreProvider } from '@/components/StoreProvider';
import { Toast, TopBar } from '@/components/TopBar';
import { getCategories, getProducts } from '@/lib/catalog';
import { CONSULT_MESSAGE } from '@/lib/copy';

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return (
    <StoreProvider productIds={products.map(p => p.id)}>
      <div className="site">
        <TopBar />
        <main className="site__main">{children}</main>
        <div className="site__footer">
          <SiteFooter categories={categories.map(c => ({ label: c.label, href: `/catalogo/${c.slug}` }))}>
            <BuyButton arrow label="Falar com consultor" message={CONSULT_MESSAGE} />
          </SiteFooter>
        </div>
        <Toast />
      </div>
    </StoreProvider>
  );
}
