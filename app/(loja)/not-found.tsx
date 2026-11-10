import { Button } from '@/components/cb/actions';

export default function NotFound() {
  return (
    <div className="page">
      <div className="wrap cart__empty">
        <h1>Página não encontrada</h1>
        <p>Esse endereço saiu da quadra.</p>
        <Button arrow href="/">Voltar ao início</Button>
      </div>
    </div>
  );
}
