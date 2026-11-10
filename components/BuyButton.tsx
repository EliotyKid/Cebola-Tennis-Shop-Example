'use client';

import { buildMessage, buildWhatsAppUrl, type WaItem } from '@/lib/whatsapp';
import { Button } from './cb/actions';

export function BuyButton({ items, message, label = 'Comprar', variant, size, block, arrow }: {
  items?: WaItem[]; message?: string; label?: string; variant?: 'primary' | 'dark' | 'light' | 'outline'; size?: 'sm' | 'md' | 'lg'; block?: boolean; arrow?: boolean;
}) {
  const url = buildWhatsAppUrl(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, message ?? buildMessage(items ?? []));
  if (!url) {
    return (
      <span className="buy-off">
        <Button variant={variant} size={size} block={block} disabled>{label}</Button>
        <small>WhatsApp ainda não configurado</small>
      </span>
    );
  }
  return <Button variant={variant} size={size} block={block} arrow={arrow} icon={arrow ? undefined : 'message-circle'} href={url} external>{label}</Button>;
}
