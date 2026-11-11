'use client';

import { useRef, useState } from 'react';
import type { Product } from '@/lib/types';
import { CarouselNav } from './cb/actions';
import { SectionHeader } from './cb/content';
import { ProductTile } from './ProductTile';

export function ProductRail({ title, products }: { title: string; products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const onScroll = () => {
    const el = ref.current;
    if (el) setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  };
  const by = (d: number) => ref.current?.scrollBy({ left: d * (ref.current.clientWidth * 0.6), behavior: 'smooth' });
  return (
    <>
      <div className="wrap"><SectionHeader className="sec-head" title={title} aside={<CarouselNav onPrev={() => by(-1)} onNext={() => by(1)} prevDisabled={edge.start} nextDisabled={edge.end} />} /></div>
      <div ref={ref} onScroll={onScroll} className="kit-rail rail">
        {products.map(p => <div key={p.id} className="rail__item"><ProductTile product={p} /></div>)}
      </div>
    </>
  );
}
