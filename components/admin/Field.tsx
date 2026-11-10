import type { ReactNode } from 'react';

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className={`cb-field${error ? ' cb-field--error' : ''}`}>
      <span className="cb-field__label">{label}</span>
      {children}
      {error || hint ? <span className="cb-field__hint" role={error ? 'alert' : undefined}>{error ?? hint}</span> : null}
    </label>
  );
}
