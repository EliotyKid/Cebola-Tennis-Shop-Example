import type { Metadata } from 'next';
import { CatalogView } from '@/components/catalog/CatalogView';
import { loadCatalog, type RawSearch } from '@/lib/catalog-page';

export const metadata: Metadata = { title: 'Catálogo', description: 'Raquetes, calçados, bolas, bonés e tudo para o seu jogo.' };

export default async function CatalogPage({ searchParams }: { searchParams: Promise<RawSearch> }) {
  const data = await loadCatalog(await searchParams);
  const title = data.query.onSale ? 'Promoções' : 'Catálogo';
  return <CatalogView {...data} title={title} crumbs={[{ label: 'Início', href: '/' }, { label: title }]} />;
}
