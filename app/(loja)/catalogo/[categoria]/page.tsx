import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CatalogView } from '@/components/catalog/CatalogView';
import { getCategoryBySlug } from '@/lib/catalog';
import { loadCatalog, type RawSearch } from '@/lib/catalog-page';

type Props = { params: Promise<{ categoria: string }>; searchParams: Promise<RawSearch> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).categoria);
  if (!category) return {};
  return { title: category.label, description: `${category.label} para tênis na Cebola Tennis Shop.`, openGraph: { images: [category.image] } };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await getCategoryBySlug((await params).categoria);
  if (!category) notFound();
  const data = await loadCatalog(await searchParams, category);
  return (
    <CatalogView
      {...data}
      title={category.label}
      activeCategory={category.id}
      crumbs={[{ label: 'Início', href: '/' }, { label: 'Catálogo', href: '/catalogo' }, { label: category.label }]}
    />
  );
}
