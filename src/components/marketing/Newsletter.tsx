'use client';

import { useState } from 'react';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { buttonClass } from '@/components/ui/Button';
import { newsletterConfig } from '@/config/forms';
import { trackNewsletterSignup } from '@/lib/analytics';
import { newsletterSchema, submitToEndpoint, toFieldIssues, type SubmitState } from '@/lib/forms';
import { cn } from '@/lib/utils';

/**
 * Newsletter.
 *
 * O cadastro vai para o endpoint configurado em `NEXT_PUBLIC_NEWSLETTER_ENDPOINT`.
 * Enquanto ele nao existir, o formulario informa que o envio ainda nao esta
 * conectado — nao existe confirmacao falsa aqui.
 */
export function Newsletter({ className }: { className?: string }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<SubmitState>({ status: 'idle' });

  const fieldError =
    state.status === 'invalid'
      ? state.issues.find((issue) => issue.field === 'email')?.message
      : undefined;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = newsletterSchema.safeParse({ email });
    if (!parsed.success) {
      setState({ status: 'invalid', issues: toFieldIssues(parsed.error) });
      return;
    }

    setState({ status: 'pending' });
    const result = await submitToEndpoint(newsletterConfig.endpoint, {
      ...parsed.data,
      source: newsletterConfig.channel,
    });

    if (result.ok) {
      trackNewsletterSignup(newsletterConfig.channel);
      setEmail('');
      setState({ status: 'success', message: newsletterConfig.successMessage });
      return;
    }

    setState({
      status: 'error',
      message:
        result.reason === 'disconnected'
          ? newsletterConfig.disconnectedMessage
          : 'Não foi possível concluir o cadastro agora. Tente novamente em instantes.',
    });
  }

  return (
    <Section spacing="tight" className={cn('bg-surface', className)}>
      <Container>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="type-heading text-heading-lg">{newsletterConfig.title}</h2>
            <p className="type-body text-body text-muted mt-3 max-w-[var(--measure-prose)]">
              {newsletterConfig.description}
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate className="lg:pt-2">
            <label htmlFor="newsletter-email" className="type-label text-label text-muted">
              E-mail
            </label>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                id="newsletter-email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={newsletterConfig.placeholder}
                aria-invalid={fieldError ? true : undefined}
                aria-describedby={fieldError ? 'newsletter-error' : 'newsletter-status'}
                className="border-border focus:border-primary type-body text-body h-11 w-full border-b bg-transparent transition-colors outline-none"
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={state.status === 'pending'}
                className={buttonClass({ variant: 'primary', size: 'md' })}
              >
                {state.status === 'pending' ? 'Enviando…' : newsletterConfig.submitLabel}
              </button>
            </div>

            {fieldError ? (
              <p id="newsletter-error" className="type-body text-body-sm text-danger mt-2">
                {fieldError}
              </p>
            ) : null}

            <p
              id="newsletter-status"
              role="status"
              aria-live="polite"
              className={cn(
                'type-body text-body-sm mt-3 max-w-[var(--measure-prose)]',
                state.status === 'success' ? 'text-success' : 'text-muted',
              )}
            >
              {state.status === 'success' || state.status === 'error' ? (
                <span key={state.status} className="status-in inline-block">
                  {state.message}
                </span>
              ) : null}
            </p>
          </form>
        </div>
      </Container>
    </Section>
  );
}
