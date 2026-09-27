'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { useOverlayMotion } from '@/lib/overlay-motion';
import { cn } from '@/lib/utils';

/**
 * Painel lateral.
 *
 * Mesmo comportamento do modal — `Esc`, foco preso, foco devolvido ao gatilho e
 * rolagem do fundo travada — mudando apenas a ancoragem na tela. Serve para a
 * sacola, o menu mobile e os filtros.
 *
 * Entrada e saida sao animadas. O efeito do foco depende apenas de `open`: antes ele
 * dependia tambem de `onClose`, que troca de identidade a cada render do consumidor, e
 * o painel roubava o foco no meio de uma interacao — por exemplo, ao clicar duas vezes
 * seguidas no seletor de quantidade da sacola.
 */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = 'right',
  className,
  bodyClassName,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'right' | 'left';
  className?: string;
  bodyClassName?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const { mounted, state, requestClose } = useOverlayMotion(open, onClose);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        requestClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      );
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
  const panelAnimation = entering
    ? side === 'right'
      ? 'panel-enter-right'
      : 'panel-enter-left'
    : side === 'right'
      ? 'panel-exit-right'
      : 'panel-exit-left';

  return (
    <div className="fixed inset-0 z-[var(--z-drawer)]">
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
          'bg-background shadow-overlay absolute inset-y-0 flex w-full max-w-md flex-col',
          side === 'right' ? 'right-0' : 'left-0',
          panelAnimation,
          className,
        )}
      >
        <div className="border-border flex items-center justify-between border-b px-5 py-4">
          <h2 className="type-heading text-heading-md">{title}</h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Fechar painel"
            className="text-muted hover:text-primary transition-colors"
          >
            <X size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
        <div className={cn('flex-1 overflow-y-auto px-5 py-5', bodyClassName)}>{children}</div>
        {footer ? <div className="border-border border-t px-5 py-5">{footer}</div> : null}
      </div>
    </div>
  );
}
