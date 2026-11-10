'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/admin/login/actions';
import { Button } from '@/components/cb/actions';
import { Logo } from '@/components/cb/brand';

export function LoginForm({ next }: { next: string }) {
  const [error, action, pending] = useActionState(loginAction, null);
  return (
    <main className="adm-login">
      <form className="adm-login__card" action={action}>
        <Logo height={44} />
        <div>
          <h1>Entrar no admin</h1>
          <p>Acesso restrito à equipe da loja.</p>
        </div>
        <input type="hidden" name="next" value={next} />
        <label className="cb-field">
          <span className="cb-field__label">E-mail</span>
          <span className="cb-input"><input name="email" type="email" autoComplete="username" required autoFocus /></span>
        </label>
        <label className="cb-field">
          <span className="cb-field__label">Senha</span>
          <span className="cb-input"><input name="password" type="password" autoComplete="current-password" required /></span>
        </label>
        {error ? <p className="adm-alert adm-alert--error" role="alert">{error}</p> : null}
        <Button type="submit" block disabled={pending}>{pending ? 'Entrando...' : 'Entrar'}</Button>
      </form>
    </main>
  );
}
