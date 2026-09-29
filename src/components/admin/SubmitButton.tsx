'use client';

import { useFormStatus } from 'react-dom';
import { Button, type ButtonProps } from '@/components/ui/Button';

/**
 * Botao de envio com estado de espera.
 *
 * O formulario do painel grava no banco: enviar duas vezes o mesmo "Salvar" criaria dois
 * registros. `useFormStatus` desabilita enquanto a action roda.
 */
export function SubmitButton({ children, pendingLabel, ...props }: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? (pendingLabel ?? 'Salvando…') : children}
    </Button>
  );
}

/** Envio destrutivo: pede confirmacao antes de mandar. */
export function ConfirmButton({ message, children, ...props }: ButtonProps & { message: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
