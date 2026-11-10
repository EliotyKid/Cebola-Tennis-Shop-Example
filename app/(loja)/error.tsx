'use client';

import { Button } from '@/components/cb/actions';

export default function StoreError({ reset }: { reset: () => void }) {
  return (
    <div className="page">
      <div className="wrap cart__empty">
        <h1>Não foi possível carregar esta página</h1>
        <p>Verifique sua conexão e tente novamente em instantes.</p>
        <Button onClick={reset}>Tentar novamente</Button>
      </div>
    </div>
  );
}
