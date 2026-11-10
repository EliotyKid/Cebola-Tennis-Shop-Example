'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export function Reveal({ children, delay = 0, style, className = '' }: { children: ReactNode; delay?: number; style?: CSSProperties; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`cb-reveal ${seen ? 'cb-reveal--in ' : ''}${className}`} style={{ transitionDelay: `${delay}ms`, ...style }}>{children}</div>;
}
