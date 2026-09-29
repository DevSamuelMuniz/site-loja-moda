'use client';

import { useActionState } from 'react';
import { Notice } from '@/components/admin/Notice';
import { SubmitButton } from '@/components/admin/SubmitButton';
import type { ButtonVariant } from '@/components/ui/Button';

/**
 * Formulario do painel.
 *
 * A action roda no servidor e devolve `{ ok, message }`: erro de validacao e de regra de
 * negocio (estoque insuficiente, por exemplo) aparece **na mesma pagina**, com o que foi
 * digitado ainda no lugar. Sucesso costuma redirecionar para a lista, e ai o aviso vem por
 * `FlashNotice`.
 *
 * Componente cliente porque usa `useActionState`; os campos chegam como `children`, ja
 * renderizados no servidor.
 */

export interface FormState {
  ok: boolean;
  message?: string;
}

export type FormAction = (state: FormState, formData: FormData) => Promise<FormState>;

export const initialFormState: FormState = { ok: true };

export function AdminForm({
  action,
  submitLabel,
  submitVariant = 'primary',
  pendingLabel,
  className,
  children,
  secondary,
}: {
  action: FormAction;
  submitLabel: string;
  submitVariant?: ButtonVariant;
  pendingLabel?: string;
  className?: string;
  children: React.ReactNode;
  /** Acoes extras ao lado do botao de envio (excluir, duplicar). */
  secondary?: React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className={className ?? 'flex flex-col gap-6'}>
      {state.message && !state.ok ? <Notice tone="danger">{state.message}</Notice> : null}
      {children}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton variant={submitVariant} pendingLabel={pendingLabel}>
          {submitLabel}
        </SubmitButton>
        {secondary}
      </div>
    </form>
  );
}
