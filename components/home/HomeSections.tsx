'use client';

import { useEffect, useState } from 'react';
import { CarouselNav } from '@/components/cb/actions';
import { BrandMarquee, FeatureCard, GlassLabel, SectionHeader, TestimonialCard } from '@/components/cb/content';
import { BuyButton } from '@/components/BuyButton';
import { Reveal } from '@/components/Reveal';
import { SafeImage } from '@/components/SafeImage';
import { CONSULT_MESSAGE } from '@/lib/copy';
import { FEATURES, TESTIMONIALS } from '@/data/home';

export function Brands({ brands }: { brands: string[] }) {
  return <BrandMarquee brands={brands} hrefFor={b => `/catalogo?marca=${encodeURIComponent(b)}`} />;
}

export function WhyCebola() {
  const [hovered, setHovered] = useState(2);
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const f = () => setDesktop(mq.matches);
    f();
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, []);
  return (
    <div className="wrap">
      <SectionHeader className="sec-head" title="Por que escolher a Cebola" />
      <Reveal>
        <div className="kit-rail feat-row">
          {FEATURES.map((f, i) => <FeatureCard key={f.title} {...f} open={!desktop || hovered === i} onMouseEnter={() => setHovered(i)} />)}
        </div>
      </Reveal>
    </div>
  );
}

export function Consulting() {
  return (
    <div className="wrap consult">
      <div>
        <h2 className="consult__title">Consultoria de quem<br /><span>vive a quadra</span></h2>
        <div className="consult__card">
          <div className="consult__layer consult__layer--blue" />
          <div className="consult__layer consult__layer--green" />
          <div className="consult__photo">
            <SafeImage src="/sample/lifestyle/stands-player.jpg" alt="" />
            <div className="consult__quote"><GlassLabel style={{ height: 'auto', padding: '8px 12px', whiteSpace: 'normal', lineHeight: 1.3, borderRadius: 12, fontSize: 12 }}>“Te ajudo a escolher a raquete para o seu jogo”</GlassLabel></div>
            <div className="consult__who"><strong>Marina Alves</strong><span>Consultora de tênis · 8 anos de quadra</span></div>
          </div>
        </div>
      </div>
      <Reveal className="consult__side">
        <h3>Atendemos jogadores de todos os níveis</h3>
        <p>Do primeiro saque ao circuito de torneios</p>
        <div className="consult__img"><SafeImage src="/sample/lifestyle/player-forehand.jpg" alt="" /></div>
        <div className="consult__cta"><BuyButton arrow label="Consultoria online" message={CONSULT_MESSAGE} /></div>
      </Reveal>
    </div>
  );
}

export function Testimonials() {
  const [i, setI] = useState(0);
  const cur = TESTIMONIALS[i];
  const n = TESTIMONIALS.length;
  return (
    <div className="wrap">
      <SectionHeader className="sec-head" title="O que dizem sobre nós" aside={<CarouselNav onPrev={() => setI((i + n - 1) % n)} onNext={() => setI((i + 1) % n)} />} />
      <div className="quotes">
        <div className="quotes__side only-desktop-block"><SafeImage src="/sample/lifestyle/court-aerial.jpg" alt="" /></div>
        <TestimonialCard key={i} {...cur} style={{ animation: 'cb-fade-up var(--dur-slow) var(--ease-out)' }} />
        <div className="quotes__end only-desktop-flex">
          <span>{i + 1} <em>/ {n}</em></span>
          <div><SafeImage src="/sample/lifestyle/team-bench.jpg" alt="" /></div>
        </div>
      </div>
    </div>
  );
}
