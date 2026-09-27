'use client';

import { useState } from 'react';
import { buttonClass } from '@/components/ui/Button';
import { contactConfig } from '@/config/forms';
import { contactSchema, submitToEndpoint, toFieldIssues, type SubmitState } from '@/lib/forms';
import { cn } from '@/lib/utils';

/**
 * Formulario de contato.
 *
 * Valida no cliente, envia para `NEXT_PUBLIC_CONTACT_ENDPOINT` e informa o
 * resultado real. Sem endpoint configurado, orienta a usar WhatsApp ou e-mail em vez
 * de fingir um envio.
 */

const subjects = [
  'Dúvida sobre um produto',
  'Pedido e entrega',
  'Troca ou devolução',
  'Parceria e imprensa',
  'Outro assunto',
];

const fieldClass =
  'border-border focus:border-primary type-body text-body h-11 w-full border-b bg-transparent outline-none transition-colors';

export function ContactForm({ className }: { className?: string }) {
  const [state, setState] = useState<SubmitState>({ status: 'idle' });
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    subject: subjects[0] ?? '',
    message: '',
  });

  const issues = state.status === 'invalid' ? state.issues : [];
  const errorFor = (field: string) => issues.find((issue) => issue.field === field)?.message;

  function update(field: keyof typeof values, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      setState({ status: 'invalid', issues: toFieldIssues(parsed.error) });
      return;
    }

    setState({ status: 'pending' });
    const result = await submitToEndpoint(contactConfig.endpoint, parsed.data);

    if (result.ok) {
      setValues({ name: '', email: '', phone: '', subject: subjects[0] ?? '', message: '' });
      setState({ status: 'success', message: contactConfig.successMessage });
      return;
    }

    setState({
      status: 'error',
      message:
        result.reason === 'disconnected'
          ? contactConfig.disconnectedMessage
          : 'Não foi possível enviar sua mensagem agora. Tente novamente em instantes.',
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className={cn('flex flex-col gap-6', className)}>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="contact-name" label="Nome" error={errorFor('name')}>
          <input
            id="contact-name"
            name="name"
            value={values.name}
            onChange={(event) => update('name', event.target.value)}
            className={fieldClass}
            autoComplete="name"
            aria-invalid={errorFor('name') ? true : undefined}
          />
        </Field>

        <Field id="contact-email" label="E-mail" error={errorFor('email')}>
          <input
            id="contact-email"
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => update('email', event.target.value)}
            className={fieldClass}
            autoComplete="email"
            aria-invalid={errorFor('email') ? true : undefined}
          />
        </Field>

        <Field id="contact-phone" label="Telefone (opcional)" error={errorFor('phone')}>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={(event) => update('phone', event.target.value)}
            className={fieldClass}
            autoComplete="tel"
            aria-invalid={errorFor('phone') ? true : undefined}
          />
        </Field>

        <Field id="contact-subject" label="Assunto" error={errorFor('subject')}>
          <select
            id="contact-subject"
            name="subject"
            value={values.subject}
            onChange={(event) => update('subject', event.target.value)}
            className={fieldClass}
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field id="contact-message" label="Mensagem" error={errorFor('message')}>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          value={values.message}
          onChange={(event) => update('message', event.target.value)}
          className={cn(fieldClass, 'h-auto resize-y py-3')}
          aria-invalid={errorFor('message') ? true : undefined}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state.status === 'pending'}
          className={buttonClass({ variant: 'primary', size: 'md' })}
        >
          {state.status === 'pending' ? 'Enviando…' : 'Enviar mensagem'}
        </button>
        <p
          role="status"
          aria-live="polite"
          className={cn(
            'type-body text-body-sm max-w-[var(--measure-prose)]',
            state.status === 'success' ? 'text-success' : 'text-muted',
          )}
        >
          {state.status === 'success' || state.status === 'error' ? (
            <span key={state.status} className="status-in inline-block">
              {state.message}
            </span>
          ) : null}
        </p>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="type-label text-label text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="type-body text-body-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
