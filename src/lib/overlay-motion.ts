'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Presenca de paineis e modais.
 *
 * Reserva um instante para a animacao de saida antes de desmontar, para que fechar
 * pelo `X`, pelo `Esc` ou pelo veu nao seja um corte seco. A entrada ja e resolvida
 * em CSS: o elemento monta com a animacao de entrada aplicada.
 *
 * O fechamento e disparado por acao da pessoa (evento), nunca por efeito — o que
 * mantem o componente livre de estado atualizado dentro de `useEffect`.
 */

/** Espelha `--duration-enter` e `--duration-exit` de `src/styles/tokens.css`. */
export const motionDurations = { enter: 260, exit: 180 } as const;

/** `true` quando a pessoa pediu menos movimento no sistema. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface OverlayMotion {
  /** Deve renderizar enquanto for verdadeiro, inclusive durante a saida. */
  mounted: boolean;
  state: 'open' | 'closed';
  /** Fecha com animacao. Identidade estavel, para nao recriar efeitos do consumidor. */
  requestClose: () => void;
}

export function useOverlayMotion(
  open: boolean,
  onClose: () => void,
  exitMs: number = motionDurations.exit,
): OverlayMotion {
  const [exiting, setExiting] = useState(false);
  const timer = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);

  /* Mantem o callback atual sem recriar `requestClose` a cada render do consumidor. */
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const requestClose = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }

    onCloseRef.current();

    if (prefersReducedMotion()) {
      setExiting(false);
      return;
    }

    setExiting(true);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setExiting(false);
    }, exitMs);
  }, [exitMs]);

  return {
    mounted: open || exiting,
    state: open ? 'open' : 'closed',
    requestClose,
  };
}
