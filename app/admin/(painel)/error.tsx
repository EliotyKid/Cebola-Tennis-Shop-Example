'use client';

import { Button } from '@/components/cb/actions';

export default function PanelError({ reset }: { reset: () => void }) {
  return (
    <div className="adm-page adm-empty">
      <h1>Não foi possível carregar os dados</h1>
      <p>Verifique sua conexão. Se o problema continuar, confira se o projeto do Supabase está ativo.</p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
