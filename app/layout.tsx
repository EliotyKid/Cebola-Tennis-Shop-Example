import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/styles/tokens/fonts.css';
import '@/styles/tokens/colors.css';
import '@/styles/tokens/typography.css';
import '@/styles/tokens/spacing.css';
import '@/styles/tokens/effects.css';
import '@/styles/tokens/base.css';
import '@/styles/components.css';
import '@/styles/site.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'Cebola Tennis Shop', template: '%s · Cebola Tennis Shop' },
  description: 'Raquetes, calçados, bolas e acessórios de tênis, com consultoria de quem vive a quadra.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
