'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { useOverlayMotion } from '@/lib/overlay-motion';
import { cn } from '@/lib/utils';

/**
 * Janela modal.
 *
 * Cuida do que sempre falta em um modal feito na pressa: fecha com `Esc`, prende o
 * foco, devolve o foco ao elemento de origem e impede a rolagem do fundo. A entrada
 * sobe e aparece; a saida desce e some antes de desmontar.
 *
 * O efeito depende apenas de `open`, pelo mesmo motivo do `Drawer`: `onClose` troca de
 * identidade a cada render do consumidor.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const { mounted, state, requestClose } = useOverlayMotion(open, onClose);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        requestClose();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus();
    };
  }, [open, requestClose]);

  if (!mounted) return null;

  const entering = state === 'open';

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Fechar"
        onClick={requestClose}
        className={cn(
          'bg-overlay absolute inset-0 cursor-default',
          entering ? 'overlay-enter' : 'overlay-exit',
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        data-state={state}
        className={cn(
          'bg-background shadow-overlay relative max-h-[90dvh] w-full overflow-y-auto p-6 sm:max-w-2xl sm:p-8',
          'rounded-t-md sm:rounded-md',
          entering ? 'modal-enter' : 'modal-exit',
          className,
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-6">
          <div>
            <h2 className="type-heading text-heading-lg">{title}</h2>
            {description ? (
              <p className="type-body text-body-sm text-muted mt-2 max-w-[var(--measure-prose)]">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Fechar janela"
            className="text-muted hover:text-primary shrink-0 transition-colors"
          >
            <X size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
        {children}
        {footer ? <div className="mt-8">{footer}</div> : null}
      </div>
    </div>
  );
}
