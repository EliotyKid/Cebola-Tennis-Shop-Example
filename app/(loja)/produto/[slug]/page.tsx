import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/cb/navigation';
import { ProductView } from '@/components/product/ProductView';
import { ProductRail } from '@/components/ProductRail';
import { getCategories, getProductBySlug, getProducts, getRelated } from '@/lib/catalog';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProducts()).map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return {};
  return { title: product.name, description: product.description, openGraph: { title: product.name, description: product.description, images: [product.images[0]] } };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const [related, categories] = await Promise.all([getRelated(product), getCategories()]);
  const category = categories.find(c => c.id === product.categoryId);
  return (
    <div className="page page--pdp">
      <div className="wrap">
        <Breadcrumbs items={[{ label: 'Início', href: '/' }, { label: 'Catálogo', href: '/catalogo' }, ...(category ? [{ label: category.label, href: `/catalogo/${category.slug}` }] : []), { label: product.name }]} />
        <ProductView product={product} />
      </div>
      <section className="section"><ProductRail title="Você também vai gostar" products={related} /></section>
    </div>
  );
}
