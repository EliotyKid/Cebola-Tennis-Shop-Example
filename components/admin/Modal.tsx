'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '@/components/cb/actions';

// Native <dialog> gives focus trapping, Esc and the backdrop for free.
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);
  return (
    <dialog ref={ref} className="adm-modal" aria-label={title} onClose={onClose}>
      <h2>{title}</h2>
      {children}
    </dialog>
  );
}

export function ConfirmDialog({ title, children, confirmLabel, pending, error, onConfirm, onClose }: {
  title: string; children: ReactNode; confirmLabel: string; pending: boolean; error?: string | null; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="adm-modal__text">{children}</p>
      {error ? <p className="adm-alert adm-alert--error" role="alert">{error}</p> : null}
      <div className="adm-modal__actions">
        <Button variant="outline" onClick={onClose} disabled={pending}>Cancelar</Button>
        <Button variant="dark" onClick={onConfirm} disabled={pending}>{pending ? 'Excluindo...' : confirmLabel}</Button>
      </div>
    </Modal>
  );
}
