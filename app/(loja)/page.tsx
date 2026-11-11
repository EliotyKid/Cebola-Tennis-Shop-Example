import { Button } from '@/components/cb/actions';
import { CategoryTile } from '@/components/cb/commerce';
import { SectionHeader } from '@/components/cb/content';
import { Brands, Consulting, Testimonials, WhyCebola } from '@/components/home/HomeSections';
import { ProductRail } from '@/components/ProductRail';
import { ProductTile } from '@/components/ProductTile';
import { Reveal } from '@/components/Reveal';
import { getCategories, getProducts } from '@/lib/catalog';

export default async function Home() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const newArrivals = products.filter(p => p.isNew).slice(0, 8);
  const recommended = products.filter(p => !p.isNew).slice(0, 4);
  const brands = [...new Set(products.map(p => p.brand))].filter(b => b !== 'Cebola Selection');
  const tiles = categories.slice(0, 4);
  return (
    <div>
      <section className="hero">
        <div className="hero__shade" />
        <div className="hero__body">
          <h1><span style={{ animationDelay: '100ms' }}>Tênis de</span><span style={{ animationDelay: '220ms' }}>primeira</span></h1>
          <p style={{ animationDelay: '380ms' }}>Marcas originais<br />e consultoria especializada</p>
          <div className="hero__cta" style={{ animationDelay: '520ms' }}><Button variant="light" arrow size="lg" href="/catalogo">Ver catálogo</Button></div>
        </div>
      </section>
      <section className="section"><ProductRail title="Novidades" products={newArrivals} /></section>
      <section className="section">
        <div className="wrap">
          <SectionHeader className="sec-head" title="Categorias" aside={<Button size="sm" arrow href="/catalogo">Ver todas</Button>} />
          <Reveal>
            <div className="cats">
              {tiles.map(c => <CategoryTile key={c.id} href={`/catalogo/${c.slug}`} image={c.image} label={c.label} count={c.count} />)}
            </div>
          </Reveal>
        </div>
      </section>
      <section className="section section--tight"><Brands brands={brands} /></section>
      <section className="section section--tight"><WhyCebola /></section>
      <section className="section"><Consulting /></section>
      <section className="section">
        <div className="wrap">
          <SectionHeader className="sec-head" title="Recomendados" aside={<Button size="sm" arrow href="/catalogo">Ver todos</Button>} />
          <div className="recs">
            {recommended.map((p, i) => <Reveal key={p.id} delay={i * 80}><ProductTile product={p} /></Reveal>)}
          </div>
        </div>
      </section>
      <section className="section"><Testimonials /></section>
    </div>
  );
}
