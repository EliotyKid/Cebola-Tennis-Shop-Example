'use client';

import { useRef, useState } from 'react';
import { BuyButton } from '@/components/BuyButton';
import { Button, IconButton } from '@/components/cb/actions';
import { Accordion } from '@/components/cb/content';
import { OptionChip, QuantityStepper } from '@/components/cb/forms';
import { SafeImage } from '@/components/SafeImage';
import { useStore } from '@/components/StoreProvider';
import { brl, installments, pixPrice } from '@/lib/format';
import type { Product } from '@/lib/types';

function Gallery({ images, name }: { images: string[]; name: string }) {
  const [i, setI] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <>
      <div className="gallery-m only-mobile-block">
        <div ref={ref} className="kit-rail" onScroll={e => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}>
          {images.map(src => <SafeImage key={src} src={src} alt={name} />)}
        </div>
        {images.length > 1 ? <div className="gallery-m__dots">{images.map((src, k) => <span key={src} className={k === i ? 'is-on' : undefined} />)}</div> : null}
      </div>
      <div className="gallery-d only-desktop-grid">
        <div className="gallery-d__thumbs">
          {images.map((src, k) => (
            <button key={src} type="button" aria-label={`Ver imagem ${k + 1}`} className={k === i ? 'is-on' : undefined} onClick={() => setI(k)}><SafeImage src={src} alt="" /></button>
          ))}
        </div>
        <div className="gallery-d__main"><SafeImage key={i} src={images[i]} alt={name} /></div>
      </div>
    </>
  );
}

export function ProductView({ product: p }: { product: Product }) {
  const { favorites, toggleFavorite, addToCart } = useStore();
  const [picked, setPicked] = useState(() => Object.fromEntries(p.options.map(o => [o.label, o.values[0]])));
  const [qty, setQty] = useState(1);
  const attrs = p.options.map(o => ({ label: o.label, value: picked[o.label] }));
  const waItems = [{ name: p.name, qty, price: p.price, attrs, outOfStock: !p.inStock }];
  const buyLabel = p.inStock ? 'Comprar' : 'Consultar disponibilidade';
  return (
    <div className="pdp">
      <Gallery images={p.images} name={p.name} />
      <div>
        <div className="pdp__top">
          <span>{p.sku ? `Cód.: ${p.sku}` : p.brand}</span>
          <IconButton icon="heart" variant="light" favorite active={favorites.includes(p.id)} label="Favoritar" onClick={() => toggleFavorite(p.id)} />
        </div>
        <h1 className="pdp__name">{p.name}</h1>
        <div className="pdp__price">
          <strong>{brl(p.price)}</strong>
          {p.oldPrice ? <s>{brl(p.oldPrice)}</s> : null}
        </div>
        <div className="pdp__pay">{installments(p.price)} · <b>{brl(pixPrice(p.price))} no Pix</b></div>
        {p.inStock ? null : <p className="pdp__stock">Fora de estoque. Fale com a gente para saber quando volta ou encomendar.</p>}
        {p.options.map(o => (
          <div key={o.label} className="pdp__option">
            <div className="pdp__label">{o.label}</div>
            <div className="cb-chipgroup">{o.values.map(v => <OptionChip key={v} selected={picked[o.label] === v} onClick={() => setPicked(s => ({ ...s, [o.label]: v }))}>{v}</OptionChip>)}</div>
          </div>
        ))}
        <div className="pdp__buy">
          <QuantityStepper value={qty} onChange={setQty} />
          <BuyButton items={waItems} label={buyLabel} />
          <Button variant="outline" icon="shopping-bag" disabled={!p.inStock} onClick={() => addToCart(p.id, p.name, qty, attrs)}>Adicionar à sacola</Button>
        </div>
        <Accordion defaultOpen={[0]} items={[
          { title: 'Descrição', content: <p>{p.description}</p> },
          { title: 'Pagamento e entrega', content: <p>Frete, prazo e forma de pagamento são combinados no atendimento pelo WhatsApp.</p> },
        ]} />
      </div>
      <div className="pdp__bar only-mobile-flex">
        <span>{brl(p.price)}</span>
        <BuyButton items={waItems} label={buyLabel} />
      </div>
    </div>
  );
}
