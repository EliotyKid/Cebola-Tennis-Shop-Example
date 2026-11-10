'use client';

import Link from 'next/link';
import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { brl } from '@/lib/format';
import type { CartAttr } from '@/lib/cart';
import { Button, IconButton } from './actions';
import { GlassLabel } from './content';
import { QuantityStepper } from './forms';
import { SafeImage } from '../SafeImage';

export function ProductCard({ href, image, name, brand, price, oldPrice, installments, badge, favorite = false, onFavorite, onQuickAdd, className = '' }: {
  href: string; image: string; name: string; brand?: string; price: number; oldPrice?: number; installments?: string;
  badge?: { label: string; tone?: 'lime' | 'dark' | 'sale' | 'light' }; favorite?: boolean; onFavorite?: () => void; onQuickAdd?: () => void; className?: string;
}) {
  return (
    <article className={`cb-pcard ${className}`}>
      <div className="cb-pcard__media">
        <SafeImage src={image} alt={name} loading="lazy" />
        {badge ? <span className="cb-pcard__badge"><GlassLabel size="sm" tone={badge.tone ?? 'lime'}>{badge.label}</GlassLabel></span> : null}
        {onFavorite ? (
          <span className={`cb-pcard__fav${favorite ? ' cb-pcard__fav--on' : ''}`}>
            <IconButton icon="heart" variant="white" size="sm" favorite active={favorite} label="Favoritar" onClick={onFavorite} />
          </span>
        ) : null}
        {onQuickAdd ? <span className="cb-pcard__quick"><Button size="sm" block onClick={onQuickAdd}>Adicionar à sacola</Button></span> : null}
      </div>
      <div className="cb-pcard__info">
        {brand ? <span className="cb-pcard__brand">{brand}</span> : null}
        <h3 className="cb-pcard__name"><Link href={href}>{name}</Link></h3>
        <div className="cb-pcard__price">
          <span>{brl(price)}</span>
          {oldPrice ? <span className="cb-pcard__old">{brl(oldPrice)}</span> : null}
        </div>
        {installments ? <span className="cb-pcard__inst">{installments}</span> : null}
      </div>
    </article>
  );
}

export function CategoryTile({ href, image, label, count, className = '', style }: { href: string; image: string; label: string; count: number; className?: string; style?: CSSProperties }) {
  return (
    <Link className={`cb-cat ${className}`} style={style} href={href}>
      <SafeImage src={image} alt="" loading="lazy" />
      <span className="cb-cat__label"><GlassLabel>{label}</GlassLabel></span>
      <span className="cb-cat__count">{count} produtos</span>
      <span className="cb-cat__go" aria-hidden="true"><span className="cb-iconbtn cb-iconbtn--lime"><Arrow /></span></span>
    </Link>
  );
}

function Arrow() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>;
}

export function CartItem({ image, name, attrs, qty, onQty, price, onRemove, outOfStock = false }: { image: string; name: string; attrs: CartAttr[]; qty: number; onQty: (q: number) => void; price: number; onRemove: () => void; outOfStock?: boolean }) {
  const stock = outOfStock ? <p className="cb-cartitem__stock">Fora de estoque: fora do total, consultamos no WhatsApp.</p> : null;
  const attrList = attrs.length || outOfStock
    ? <>{attrs.length ? <dl className="cb-cartitem__attrs">{attrs.map(a => <Fragment key={a.label}><dt>{a.label}:</dt><dd>{a.value}</dd></Fragment>)}</dl> : null}{stock}</>
    : null;
  const remove = <button type="button" className="cb-cartitem__remove" onClick={onRemove}>Remover</button>;
  const stepper = <QuantityStepper size="sm" value={qty} onChange={onQty} />;
  const total = <span className="cb-cartitem__price">{brl(price * qty)}</span>;
  const img = <div className="cb-cartitem__img"><SafeImage src={image} alt={name} /></div>;
  return (
    <>
      <div className="cb-cartitem only-wide">
        {img}
        <div className="cb-cartitem__main"><h3 className="cb-cartitem__name">{name}</h3>{attrList}</div>
        <div className="cb-cartitem__side">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(16px,4vw,96px)' }}>{stepper}{total}</div>
          {remove}
        </div>
      </div>
      <div className="cb-cartitem cb-cartitem--compact only-narrow">
        {img}
        <div className="cb-cartitem__main">
          <div className="cb-cartitem__row" style={{ alignItems: 'flex-start' }}><h3 className="cb-cartitem__name">{name}</h3>{remove}</div>
          {attrList}
          <div className="cb-cartitem__row">{stepper}{total}</div>
        </div>
      </div>
    </>
  );
}

export function OrderSummary({ count, total, action, note }: { count: number; total: number; action: ReactNode; note?: string }) {
  return (
    <div className="cb-summary">
      <div className="cb-summary__rows">
        <div className="cb-summary__row"><span>Produtos, {count} un.</span><span>{brl(total)}</span></div>
      </div>
      <div className="cb-summary__total"><span>Total estimado</span><strong>{brl(total)}</strong></div>
      {action}
      {note ? <div className="cb-summary__note">{note}</div> : null}
    </div>
  );
}
