'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Fecha um menu aberto quando a pessoa clica fora dele ou pressiona `Esc`.
 *
 * Existe porque menu controlado por CSS puro (`:hover` / `:focus-within`) abre bem e
 * fecha mal: depois de clicar em um item, ele continua pendurado sobre a pagina ate o
 * ponteiro sair. Aqui o fechamento e por estado, entao qualquer clique fora resolve.
 *
 * O callback fica em uma ref para que o consumidor nao precise memorizar a funcao — e
 * para que os listeners nao sejam recriados a cada render.
 */
export function useDismissOnOutside(
  open: boolean,
  onDismiss: () => void,
  ref: RefObject<HTMLElement | null>,
): void {
  const dismiss = useRef(onDismiss);

  useEffect(() => {
    dismiss.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const node = ref.current;
      if (node && !node.contains(event.target as Node)) dismiss.current();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') dismiss.current();
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, ref]);
}
