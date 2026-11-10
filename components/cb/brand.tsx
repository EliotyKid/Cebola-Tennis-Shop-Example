import {
  ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, Heart, MapPin, Menu, MessageCircle, Minus, Plus,
  ShoppingBag, SlidersHorizontal, X, type LucideIcon,
} from 'lucide-react';
import type { CSSProperties } from 'react';

const LOGOS = { dark: 'cebola-logo-dark.png', light: 'cebola-logo-light.png' };

export function Logo({ variant = 'dark', height = 40, className = '', style }: {
  variant?: keyof typeof LOGOS; height?: number; className?: string; style?: CSSProperties;
}) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={`cb-logo ${className}`} src={`/brand/logo/${LOGOS[variant]}`} alt="Cebola Tennis Shop" draggable={false} style={{ height, ...style }} />;
}

const ICONS = {
  'arrow-up-right': ArrowUpRight,
  check: Check,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  heart: Heart,
  'map-pin': MapPin,
  menu: Menu,
  'message-circle': MessageCircle,
  minus: Minus,
  plus: Plus,
  'shopping-bag': ShoppingBag,
  'sliders-horizontal': SlidersHorizontal,
  x: X,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 20, strokeWidth = 1.5, filled = false, label, className = '', style }: {
  name: IconName; size?: number; strokeWidth?: number; filled?: boolean; label?: string; className?: string; style?: CSSProperties;
}) {
  const Glyph = ICONS[name];
  return (
    <span className={`cb-icon ${className}`} style={{ width: size, height: size, ...style }} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <Glyph size={size} strokeWidth={strokeWidth} fill={filled ? 'currentColor' : 'none'} />
    </span>
  );
}
