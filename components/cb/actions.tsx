'use client';

import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './brand';

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  variant?: 'primary' | 'dark' | 'light' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  arrow?: boolean;
  icon?: IconName;
  block?: boolean;
  href?: string;
  external?: boolean;
  children: ReactNode;
};

export function Button({ variant = 'primary', size = 'md', arrow = false, icon, block = false, disabled = false, href, external = false, type = 'button', children, className = '', style, ...rest }: ButtonProps) {
  const cls = ['cb-btn', `cb-btn--${variant}`, size !== 'md' && `cb-btn--${size}`, block && 'cb-btn--block', arrow && 'cb-btn--arrow', disabled && 'cb-btn--disabled', className].filter(Boolean).join(' ');
  const is = size === 'sm' ? 16 : 18;
  const inner = (
    <>
      {icon ? <Icon name={icon} size={is} /> : null}
      <span>{children}</span>
      {arrow ? <span className="cb-btn__arrow"><Icon name="arrow-up-right" size={size === 'sm' ? 14 : 16} /></span> : null}
    </>
  );
  if (href && external) return <a className={cls} style={style} href={href} target="_blank" rel="noopener noreferrer">{inner}</a>;
  if (href) return <Link className={cls} style={style} href={href}>{inner}</Link>;
  return <button type={type} className={cls} style={style} disabled={disabled} {...rest}>{inner}</button>;
}

export function IconButton({ icon, variant = 'navy', size = 'md', label, badge, active = false, favorite = false, href, className = '', ...rest }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: IconName;
  variant?: 'navy' | 'lime' | 'outline' | 'glass' | 'white' | 'light';
  size?: 'sm' | 'md' | 'lg';
  label: string;
  badge?: number | null;
  active?: boolean;
  favorite?: boolean;
  href?: string;
}) {
  const is = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;
  const cls = ['cb-iconbtn', `cb-iconbtn--${variant}`, size !== 'md' && `cb-iconbtn--${size}`, favorite && 'cb-iconbtn--fav', active && 'cb-iconbtn--active', className].filter(Boolean).join(' ');
  const inner = (
    <>
      <Icon key={favorite && active ? 'on' : 'off'} name={icon} size={is} filled={favorite && active} />
      {badge ? <span key={badge} className="cb-iconbtn__badge">{badge}</span> : null}
    </>
  );
  if (href) return <Link className={cls} href={href} aria-label={label}>{inner}</Link>;
  return <button type="button" aria-label={label} aria-pressed={favorite ? active : undefined} className={cls} {...rest}>{inner}</button>;
}

export function CarouselNav({ onPrev, onNext, prevDisabled = false, nextDisabled = false, className = '' }: {
  onPrev?: () => void; onNext?: () => void; prevDisabled?: boolean; nextDisabled?: boolean; className?: string;
}) {
  return (
    <div className={`cb-carnav ${className}`}>
      <IconButton icon="chevron-left" variant="outline" size="sm" label="Anterior" onClick={onPrev} disabled={prevDisabled} />
      <IconButton icon="chevron-right" variant="lime" size="sm" label="Próximo" onClick={onNext} disabled={nextDisabled} />
    </div>
  );
}
