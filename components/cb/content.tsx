'use client';

import Link from 'next/link';
import { useState, type CSSProperties, type MouseEventHandler, type ReactNode } from 'react';
import { Icon, type IconName } from './brand';
import { IconButton } from './actions';
import { SafeImage } from '../SafeImage';

export function SectionHeader({ title, aside, className = '', style }: { title: ReactNode; aside?: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`cb-sechead ${className}`} style={style}>
      <div><h2 className="cb-sechead__title">{title}</h2></div>
      {aside ? <div className="cb-sechead__aside">{aside}</div> : null}
    </div>
  );
}

export function GlassLabel({ tone = 'glass', size = 'md', icon, children, className = '', style }: {
  tone?: 'glass' | 'light' | 'lime' | 'dark' | 'sale'; size?: 'sm' | 'md'; icon?: IconName; children: ReactNode; className?: string; style?: CSSProperties;
}) {
  const cls = ['cb-glass', tone !== 'glass' && `cb-glass--${tone}`, size === 'sm' && 'cb-glass--sm', className].filter(Boolean).join(' ');
  return <span className={cls} style={style}>{icon ? <Icon name={icon} size={size === 'sm' ? 12 : 14} /> : null}{children}</span>;
}

export function Accordion({ items, defaultOpen = [0], variant = 'default', className = '' }: {
  items: { title: string; content: ReactNode }[]; defaultOpen?: number[]; variant?: 'default' | 'compact'; className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = (i: number) => setOpen(o => (o.includes(i) ? o.filter(x => x !== i) : [...o, i]));
  const cls = ['cb-acc', variant === 'compact' && 'cb-acc--compact cb-acc--flush', className].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      {items.map((it, i) => {
        const on = open.includes(i);
        return (
          <div key={it.title} className={`cb-acc__item${on ? ' cb-acc__item--open' : ''}`}>
            <button type="button" className="cb-acc__head" aria-expanded={on} onClick={() => toggle(i)}>
              <span>{it.title}</span>
              <Icon name="chevron-down" size={variant === 'compact' ? 16 : 20} className="cb-acc__chev" />
            </button>
            <div className="cb-acc__panel"><div className="cb-acc__inner"><div className="cb-acc__body">{it.content}</div></div></div>
          </div>
        );
      })}
    </div>
  );
}

export function FeatureCard({ title, text, image, open = false, onMouseEnter }: { title: string; text: string; image: string; open?: boolean; onMouseEnter?: MouseEventHandler<HTMLDivElement> }) {
  return (
    <div className={`cb-feat${open ? ' cb-feat--open' : ''}`} onMouseEnter={onMouseEnter}>
      <div className="cb-feat__col">
        <div>
          <h3 className="cb-feat__title">{title}</h3>
          <p className="cb-feat__text">{text}</p>
        </div>
      </div>
      <div className="cb-feat__img"><SafeImage src={image} alt="" /></div>
    </div>
  );
}

export function TestimonialCard({ title, text, name, role, avatar, style }: { title: string; text: string; name: string; role: string; avatar: string; style?: CSSProperties }) {
  return (
    <figure className="cb-quote" style={{ margin: 0, ...style }}>
      <div className="cb-quote__mark" aria-hidden="true">“</div>
      <h3 className="cb-quote__title">{title}</h3>
      <blockquote className="cb-quote__text" style={{ margin: 0 }}>{text}</blockquote>
      <figcaption className="cb-quote__who">
        <SafeImage src={avatar} alt="" />
        <span><div className="cb-quote__name">{name}</div><div className="cb-quote__role">{role}</div></span>
      </figcaption>
    </figure>
  );
}

export function BrandMarquee({ brands, hrefFor, duration = 40 }: { brands: string[]; hrefFor: (b: string) => string; duration?: number }) {
  const group = (k: number) => (
    <div className="cb-marquee__group" aria-hidden={k ? true : undefined} key={k}>
      {brands.map(name => <Link key={name} className="cb-marquee__item" href={hrefFor(name)} tabIndex={k ? -1 : undefined}>{name}</Link>)}
    </div>
  );
  return (
    <div className="cb-marquee">
      <div className="cb-marquee__track" style={{ '--_dur': `${duration}s` } as CSSProperties}>{group(0)}{group(1)}</div>
    </div>
  );
}
